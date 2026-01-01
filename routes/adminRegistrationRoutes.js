// routes/adminRegistrationRoutes.js
import express from "express";
import Registration from "../models/Registration.js";
import protect from "../middleware/auth.js";
import isAdmin from "../middleware/adminMiddleware.js";

const router = express.Router();

/**
 * GET all registrations
 */
router.get("/", protect, isAdmin, async (req, res) => {
  try {
    const registrations = await Registration.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, registrations });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to load registrations" });
  }
});

/**
 * ADMIN APPROVE
 */
router.put("/approve/:id", protect, isAdmin, async (req, res) => {
  try {
    const reg = await Registration.findById(req.params.id);
    if (!reg) return res.status(404).json({ message: "Not found" });

    reg.adminApproved = true;
    reg.status = "ADMIN_APPROVED";
    await reg.save();

    res.json({ success: true, message: "Admin approved" });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

/**
 * CONFIRM SEAT
 */
router.put("/confirm-seat/:id", protect, isAdmin, async (req, res) => {
  try {
    const reg = await Registration.findById(req.params.id);
    if (!reg) return res.status(404).json({ message: "Not found" });

    reg.status = "SEAT_CONFIRMED";
    await reg.save();

    res.json({ success: true, message: "Seat confirmed" });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

/**
 * ASSIGN TEST SLOT
 */
router.put("/test-slot/:id", protect, isAdmin, async (req, res) => {
  const { date, time } = req.body;

  try {
    const reg = await Registration.findById(req.params.id);
    reg.testSlot = { date, time };
    await reg.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

export default router;
