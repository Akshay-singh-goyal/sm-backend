// routes/admin.js
import express from "express";
import User from "../models/User.js";
import Registration from "../models/Registration.js";
import Newsletter from "../models/Newsletter.js";
import protect from "../middleware/auth.js"; // JWT auth middleware
import isAdmin from "../middleware/adminMiddleware.js"; // Admin-only middleware

const router = express.Router();

/* ===== GET ALL USERS (full details) ===== */
router.get("/users", protect, isAdmin, async (req, res) => {
  try {
    // Exclude password, sort by newest first
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

/* ===== GET ALL ADMINS ===== */
router.get("/admins", protect, isAdmin, async (req, res) => {
  try {
    const admins = await User.find({ role: "admin" }).select("-password");
    res.status(200).json(admins);
  } catch (err) {
    console.error("Get admins error:", err);
    res.status(500).json({ message: "Failed to fetch admins" });
  }
});

/* ===== GET REGISTRATIONS ===== */
router.get("/registrations", protect, isAdmin, async (req, res) => {
  try {
    const regs = await Registration.find();
    res.status(200).json(regs);
  } catch (err) {
    console.error("Get registrations error:", err);
    res.status(500).json({ message: "Failed to fetch registrations" });
  }
});

/* ===== GET NEWSLETTER SUBSCRIBERS ===== */
router.get("/newsletter", protect, isAdmin, async (req, res) => {
  try {
    const subscribers = await Newsletter.find();
    res.status(200).json(subscribers);
  } catch (err) {
    console.error("Get newsletter error:", err);
    res.status(500).json({ message: "Failed to fetch newsletter" });
  }
});

/* ===== BLOCK / UNBLOCK USER ===== */
router.put("/block/:id", protect, isAdmin, async (req, res) => {
  try {
    const { isBlocked } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isBlocked = isBlocked;
    await user.save();

    res.status(200).json({
      message: `User ${isBlocked ? "blocked" : "unblocked"} successfully`,
      user, // returning full updated user
    });
  } catch (err) {
    console.error("Block user error:", err);
    res.status(500).json({ message: "Failed to update block status" });
  }
});

/* ===== CHANGE USER ROLE ===== */
router.put("/role/:id", protect, isAdmin, async (req, res) => {
  try {
    const { role } = req.body;

    if (!["student", "teacher", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.role = role;
    await user.save();

    res.status(200).json({
      message: "Role updated successfully",
      user, // returning updated user
    });
  } catch (err) {
    console.error("Change role error:", err);
    res.status(500).json({ message: "Failed to update role" });
  }
});

/* ===== DELETE USER ===== */
router.delete("/users/:id", protect, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.deleteOne();
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ message: "Failed to delete user" });
  }
});

export default router;
