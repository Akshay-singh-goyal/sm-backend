// routes/adminRoutes.js
import express from "express";
import User from "../models/User.js";
import Registration from "../models/Registration.js";
import Newsletter from "../models/Newsletter.js";
import protect from "../middleware/auth.js"; // JWT auth
import isAdmin from "../middleware/adminMiddleware.js"; // Admin-only

const router = express.Router();

/**
 * @desc    Get all users with optional pagination & search
 * @route   GET /api/admin/users
 * @access  Admin
 */
router.get("/users", protect, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, search = "" } = req.query;

    const query = {
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    };

    const users = await User.find(query)
      .select("-password -refreshToken")
      .populate("completedCourses", "title")
      .populate("purchasedBooks", "title")
      .populate("wishlist", "title")
      .populate("paymentHistory", "-sensitiveInfo")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      limit: Number(limit),
      users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
});

/**
 * @desc    Get all admins
 * @route   GET /api/admin/admins
 * @access  Admin
 */
router.get("/admins", protect, isAdmin, async (req, res) => {
  try {
    const admins = await User.find({ role: "admin" })
      .select("-password -refreshToken")
      .lean();
    res.status(200).json({ success: true, admins });
  } catch (error) {
    console.error("Error fetching admins:", error);
    res.status(500).json({ success: false, message: "Failed to fetch admins" });
  }
});

/**
 * @desc    Get all registrations
 * @route   GET /api/admin/registrations
 * @access  Admin
 */
router.get("/registrations", protect, isAdmin, async (req, res) => {
  try {
    const registrations = await Registration.find().sort({ createdAt: -1 }).lean();
    res.status(200).json({ success: true, registrations });
  } catch (error) {
    console.error("Error fetching registrations:", error);
    res.status(500).json({ success: false, message: "Failed to fetch registrations" });
  }
});

/**
 * @desc    Get all newsletter subscribers
 * @route   GET /api/admin/newsletter
 * @access  Admin
 */
router.get("/newsletter", protect, isAdmin, async (req, res) => {
  try {
    const subscribers = await Newsletter.find().sort({ createdAt: -1 }).lean();
    res.status(200).json({ success: true, subscribers });
  } catch (error) {
    console.error("Error fetching newsletter:", error);
    res.status(500).json({ success: false, message: "Failed to fetch newsletter" });
  }
});

/**
 * @desc    Block or unblock a user
 * @route   PUT /api/admin/users/block/:id
 * @access  Admin
 */
router.put("/users/block/:id", protect, isAdmin, async (req, res) => {
  try {
    const { isBlocked } = req.body;
    if (typeof isBlocked !== "boolean") {
      return res.status(400).json({ success: false, message: "isBlocked must be boolean" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.isBlocked = isBlocked;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${isBlocked ? "blocked" : "unblocked"} successfully`,
      user,
    });
  } catch (error) {
    console.error("Error blocking/unblocking user:", error);
    res.status(500).json({ success: false, message: "Failed to update block status" });
  }
});

/**
 * @desc    Update user role
 * @route   PUT /api/admin/users/role/:id
 * @access  Admin
 */
router.put("/users/role/:id", protect, isAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    if (!["student", "teacher", "admin"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.role = role;
    await user.save();

    res.status(200).json({ success: true, message: "Role updated successfully", user });
  } catch (error) {
    console.error("Error updating role:", error);
    res.status(500).json({ success: false, message: "Failed to update role" });
  }
});

/**
 * @desc    Delete a user
 * @route   DELETE /api/admin/users/:id
 * @access  Admin
 */
router.delete("/users/:id", protect, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    await user.deleteOne();
    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ success: false, message: "Failed to delete user" });
  }
});

export default router;
