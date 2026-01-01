// routes/admin.js
import express from "express";
import User from "../models/User.js";
import protect from "../middleware/auth.js";
import isAdmin from "../middleware/adminMiddleware.js";

const router = express.Router();

/**
 * GET all users
 * GET /api/admin/users
 */
router.get("/users", protect, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

/**
 * Block / Unblock user
 * PUT /api/admin/block/:id
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
    });
  } catch (err) {
    console.error("Block user error:", err);
    res.status(500).json({ message: "Failed to update block status" });
  }
});

/**
 * Change user role
 * PUT /api/admin/role/:id
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

    res.status(200).json({ message: "Role updated successfully" });
  } catch (err) {
    console.error("Change role error:", err);
    res.status(500).json({ message: "Failed to update role" });
  }
});

/**
 * Delete user
 * DELETE /api/admin/users/:id
 */
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
