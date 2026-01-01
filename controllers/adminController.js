const User = require("../models/User");

/**
 * GET /api/admin/users
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

/**
 * PUT /api/admin/block/:id
 */
exports.toggleBlockUser = async (req, res) => {
  try {
    const { isBlocked } = req.body;

    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    user.isBlocked = isBlocked;
    await user.save();

    res.status(200).json({
      message: `User ${isBlocked ? "blocked" : "unblocked"} successfully`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update block status" });
  }
};

/**
 * PUT /api/admin/role/:id
 */
exports.changeUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!["student", "teacher", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    user.role = role;
    await user.save();

    res.status(200).json({ message: "Role updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update role" });
  }
};

/**
 * DELETE /api/admin/users/:id
 */
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    await user.deleteOne();
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete user" });
  }
};
