const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

/* ================= REGISTER ================= */
router.post("/register", async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;
    if (!name || !email || !mobile || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { mobile }],
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      mobile,
      password, // pre-save middleware will hash the password
    });

    res.status(201).json({
      message: "Registration successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= LOGIN ================= */
router.post("/login", async (req, res) => {
  try {
    const { email, mobile, password } = req.body;

    if ((!email && !mobile) || !password) {
      return res.status(400).json({ message: "Email or Mobile and Password required" });
    }

    const user = email
      ? await User.findOne({ email: email.trim().toLowerCase() })
      : await User.findOne({ mobile });

    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // Check account lock
    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(403).json({ message: "Account locked. Try later." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      if (user.loginAttempts >= 5) {
        user.lockUntil = Date.now() + 30 * 60 * 1000; // lock for 30 mins
      }
      await user.save();
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Reset login attempts on successful login
    user.loginAttempts = 0;
    user.lockUntil = undefined;

    // Generate tokens
    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= REFRESH TOKEN ================= */
router.post("/refresh-token", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: "Refresh token required" });

    const user = await User.findOne({ refreshToken });
    if (!user) return res.status(403).json({ message: "Invalid refresh token" });

    jwt.verify(refreshToken, process.env.REFRESH_SECRET, (err) => {
      if (err) return res.status(403).json({ message: "Refresh token expired" });

      const newAccessToken = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
      );
      res.json({ accessToken: newAccessToken });
    });
  } catch (err) {
    console.error("Refresh Token Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
