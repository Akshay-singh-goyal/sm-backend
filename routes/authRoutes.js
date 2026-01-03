// routes/userRoutes.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import protect from "../middleware/auth.js";

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
      password, // hashed via pre-save middleware
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
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= LOGIN ================= */
router.post("/login", async (req, res) => {
  try {
    const { email, mobile, password } = req.body;

    if ((!email && !mobile) || !password) {
      return res.status(400).json({
        message: "Email or Mobile and Password required",
      });
    }

    const user = email
      ? await User.findOne({ email: email.trim().toLowerCase() })
      : await User.findOne({ mobile });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    /* Account lock check */
    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(403).json({
        message: "Account locked. Try later.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;

      if (user.loginAttempts >= 5) {
        user.lockUntil = Date.now() + 30 * 60 * 1000; // 30 mins lock
      }

      await user.save();
      return res.status(400).json({ message: "Invalid credentials" });
    }

    /* Reset attempts on success */
    user.loginAttempts = 0;
    user.lockUntil = undefined;

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
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= REFRESH TOKEN ================= */
router.post("/refresh-token", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token required" });
    }

    const user = await User.findOne({ refreshToken });
    if (!user) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    jwt.verify(refreshToken, process.env.REFRESH_SECRET, (error) => {
      if (error) {
        return res.status(403).json({ message: "Refresh token expired" });
      }

      const newAccessToken = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
      );

      res.json({ accessToken: newAccessToken });
    });
  } catch (error) {
    console.error("Refresh Token Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});


/* ================= GET CURRENT USER ================= */
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select(
        "-password -refreshToken -loginAttempts -lockUntil -settings" // hide sensitive
      )
      .populate("bookmarks", "university branch subject subjectCode topic"); // populate bookmarks

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("GET ME ERROR:", err);
    res.status(500).json({ message: "Failed to fetch user data" });
  }
});

/* ================= UPDATE BOOKMARKS ================= */
router.put("/me/bookmarks", protect, async (req, res) => {
  try {
    const { bookmarks } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.bookmarks = bookmarks || [];
    await user.save();

    res.json({ message: "Bookmarks updated", bookmarks: user.bookmarks });
  } catch (err) {
    console.error("BOOKMARK UPDATE ERROR:", err);
    res.status(500).json({ message: "Failed to update bookmarks" });
  }
});

/* ================= UPDATE HIGHLIGHTS ================= */
router.put("/me/highlights", protect, async (req, res) => {
  try {
    const { highlights } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.highlights = highlights || {};
    await user.save();

    res.json({ message: "Highlights updated", highlights: user.highlights });
  } catch (err) {
    console.error("HIGHLIGHT UPDATE ERROR:", err);
    res.status(500).json({ message: "Failed to update highlights" });
  }
});

export default router;
