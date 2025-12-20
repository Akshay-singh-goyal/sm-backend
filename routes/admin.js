const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const isAdmin = require("../middleware/adminMiddleware");

const {
  getAllUsers,
  toggleBlockUser,
  changeUserRole,
  deleteUser,
} = require("../controllers/adminController");

router.get("/users", protect, isAdmin, getAllUsers);
router.put("/block/:id", protect, isAdmin, toggleBlockUser);
router.put("/role/:id", protect, isAdmin, changeUserRole);
router.delete("/users/:id", protect, isAdmin, deleteUser);

module.exports = router;
