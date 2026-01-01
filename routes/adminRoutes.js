import express from "express";
import User from "../models/User.js";
import Registration from "../models/Registration.js";
import Newsletter from "../models/Newsletter.js";
import protect from "../middleware/auth.js"; // JWT auth middleware
import isAdmin from "../middleware/adminMiddleware.js"; // Admin-only middleware

const router = express.Router();

/**
 * GET /users
 * Fetch all users with full details (excluding sensitive info)
 */
router.get("/users", protect, isAdmin, async (req, res) => {
  try {
    const users = await User.find()
      .select("-password -refreshToken") // exclude sensitive fields
      .populate("completedCourses", "title")
      .populate("purchasedBooks", "title")
      .populate("wishlist", "title")
      .populate("paymentHistory", "-sensitiveInfo") // adjust field names accordingly
      .lean()
      .sort({ createdAt: -1 }); // newest first

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

/**
 * GET /admins
 * Fetch all admin users
 */
router.get("/admins", protect, isAdmin, async (req, res) => {
  try {
    const admins = await User.find({ role: "admin" }).select("-password").lean();
    res.status(200).json(admins);
  } catch (error) {
    console.error("Error fetching admins:", error);
    res.status(500).json({ message: "Failed to fetch admins" });
  }
});

/**
 * GET /registrations
 * Fetch all registrations
 */
router.get("/registrations", protect, isAdmin, async (req, res) => {
  try {
    const regs = await Registration.find().lean();
    res.status(200).json(regs);
  } catch (error) {
    console.error("Error fetching registrations:", error);
    res.status(500).json({ message: "Failed to fetch registrations" });
  }
});

/**
 * GET /newsletter
 * Fetch all newsletter subscribers
 */
router.get("/newsletter", protect, isAdmin, async (req, res) => {
  try {
    const subscribers = await Newsletter.find().lean();
    res.status(200).json(subscribers);
  } catch (error) {
    console.error("Error fetching newsletter subscribers:", error);
    res.status(500).json({ message: "Failed to fetch newsletter" });
  }
});

/**
 * PUT /block/:id
 * Block or unblock a user by ID
 * Body: { isBlocked: Boolean }
 */
router.put("/block/:id", protect, isAdmin, async (req, res) => {
  try {
    const { isBlocked } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isBlocked = isBlocked;
    await user.save();

    res.status(200).json({
      message: `User ${isBlocked ? "blocked" : "unblocked"} successfully`,
      user,
    });
  } catch (error) {
    console.error("Error blocking/unblocking user:", error);
    res.status(500).json({ message: "Failed to update block status" });
  }
});

/**
 * PUT /role/:id
 * Change user role
 * Body: { role: "student" | "teacher" | "admin" }
 */
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
      user,
    });
  } catch (error) {
    console.error("Error updating role:", error);
    res.status(500).json({ message: "Failed to update role" });
  }
});

/**
 * DELETE /users/:id
 * Delete a user by ID
 */
router.delete("/users/:id", protect, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.deleteOne();

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Failed to delete user" });
  }
});

export default router;
