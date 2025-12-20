const User = require("../models/User");

/* ================= GET ALL USERS ================= */
exports.getAllUsers = async (req, res) => {
  const users = await User.find().select("-password");
  res.json({ users });
};

/* ================= BLOCK / UNBLOCK ================= */
exports.toggleBlockUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.isBlocked = !user.isBlocked;
  await user.save();

  res.json({ message: "User status updated", user });
};

/* ================= CHANGE ROLE ================= */
exports.changeUserRole = async (req, res) => {
  const { role } = req.body;

  if (!["student", "teacher", "admin"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.role = role;
  await user.save();

  res.json({ message: "Role updated", user });
};

/* ================= DELETE USER ================= */
exports.deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted" });
};
