import express from "express";
import Registration from "../models/Registration.js";

const router = express.Router();

// GET all registrations
router.get("/registrations", async (req, res) => {
  try {
    const registrations = await Registration.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });
    res.json({ success: true, registrations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// UPDATE registration status
router.put("/registration/:id/status", async (req, res) => {
  const { status, adminApproved } = req.body;
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration) return res.status(404).json({ message: "Not found" });

    if (status) registration.status = status;
    if (adminApproved !== undefined) registration.adminApproved = adminApproved;

    await registration.save();
    res.json({ success: true, registration });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// UPDATE registration mode / payment
router.put("/registration/:id/mode", async (req, res) => {
  const { mode, registrationTxnId, courseTxnId } = req.body;
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration) return res.status(404).json({ message: "Not found" });

    if (mode) registration.mode = mode;
    if (registrationTxnId) registration.registrationTxnId = registrationTxnId;
    if (courseTxnId) registration.courseTxnId = courseTxnId;

    await registration.save();
    res.json({ success: true, registration });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
