// routes/adminRoutes.js
import express from "express";
import User from "../models/User.js";
import Registration from "../models/Registration.js";
import Newsletter from "../models/Newsletter.js";
import protect from "../middleware/auth.js";
import isAdmin from "../middleware/adminMiddleware.js";

const router = express.Router();

/**
 * GET /api/admin/users
 * Safe users list (NO populate ❌)
 */
router.get("/users", protect, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, search = "" } = req.query;

    const filter = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const users = await User.find(filter)
      .select("name email role isBlocked createdAt")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      total,
      users,
    });
  } catch (error) {
    console.error("ADMIN USERS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
});

/**
 * GET /api/admin/admins
 */
router.get("/admins", protect, isAdmin, async (req, res) => {
  try {
    const admins = await User.find({ role: "admin" })
      .select("name email role")
      .lean();

    res.status(200).json({ success: true, admins });
  } catch (error) {
    console.error("ADMINS ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to fetch admins" });
  }
});

/**
 * GET /api/admin/registrations
 */
router.get("/registrations", protect, isAdmin, async (req, res) => {
  try {
    const registrations = await Registration.find()
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, registrations });
  } catch (error) {
    console.error("REGISTRATIONS ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to fetch registrations" });
  }
});

/**
 * GET /api/admin/newsletter
 */
router.get("/newsletter", protect, isAdmin, async (req, res) => {
  try {
    const subscribers = await Newsletter.find()
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, subscribers });
  } catch (error) {
    console.error("NEWSLETTER ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to fetch newsletter" });
  }
});

/**
 * PUT /api/admin/users/block/:id
 */
router.put("/users/block/:id", protect, isAdmin, async (req, res) => {
  try {
    const { isBlocked } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.isBlocked = isBlocked;
    await user.save();

    res.status(200).json({
      success: true,
      message: "User status updated",
    });
  } catch (error) {
    console.error("BLOCK USER ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to update user" });
  }
});

/**
 * PUT /api/admin/users/role/:id
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

    res.status(200).json({ success: true, message: "Role updated" });
  } catch (error) {
    console.error("ROLE UPDATE ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to update role" });
  }
});

/**
 * DELETE /api/admin/users/:id
 */
router.delete("/users/:id", protect, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    await user.deleteOne();
    res.status(200).json({ success: true, message: "User deleted" });
  } catch (error) {
    console.error("DELETE USER ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to delete user" });
  }
});

export default router;
