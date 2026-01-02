import express from "express";
import Registration from "../models/Registration.js";
import User from "../models/User.js";
import auth from "../middleware/auth.js";

const router = express.Router();

/* ================= GET STATUS ================= */
router.get("/status", auth, async (req, res) => {
  try {
    let reg = await Registration.findOne({ userId: req.userId });

    if (!reg) {
      const user = await User.findById(req.userId).select("-password");

      reg = await Registration.create({
        userId: req.userId,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        adminApproved: false,
      });
    }

    res.json({
      status: reg.status,
      mode: reg.mode,
      adminApproved: reg.adminApproved,
      name: reg.name,
      email: reg.email,
      mobile: reg.mobile,
      testSlot: reg.testSlot || null,
    });
  } catch (error) {
    console.error("GET STATUS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= SELECT MODE ================= */
router.post("/select-mode", auth, async (req, res) => {
  try {
    const { batchId, mode, termsAccepted } = req.body;

    if (!termsAccepted) {
      return res.status(400).json({ message: "Terms not accepted" });
    }

    const user = await User.findById(req.userId).select("-password");

    const reg = await Registration.findOneAndUpdate(
      { userId: req.userId },
      {
        batchId,
        mode,
        status: "MODE_SELECTED",
        termsAccepted,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        adminApproved: false,
      },
      { new: true, upsert: true }
    );

    res.json({ message: "Mode selected", reg });
  } catch (error) {
    console.error("SELECT MODE ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= REGISTRATION PAYMENT ================= */
router.post("/registration-pay", auth, async (req, res) => {
  try {
    const { transactionId } = req.body;

    if (!transactionId) {
      return res.status(400).json({ message: "Transaction ID required" });
    }

    const reg = await Registration.findOneAndUpdate(
      { userId: req.userId },
      {
        registrationTxnId: transactionId,
        status: "WAITING_ADMIN",
        adminApproved: false,
      },
      { new: true }
    );

    res.json({ message: "Registration payment submitted", reg });
  } catch (error) {
    console.error("REGISTRATION PAY ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= ADMIN APPROVAL ================= */
router.post("/admin-approve/:userId", async (req, res) => {
  try {
    const reg = await Registration.findOneAndUpdate(
      { userId: req.params.userId },
      { adminApproved: true, status: "ADMIN_APPROVED" },
      { new: true }
    );

    if (!reg) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User approved by admin", reg });
  } catch (error) {
    console.error("ADMIN APPROVE ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= TEST SLOT ================= */
router.post("/test-slot", auth, async (req, res) => {
  try {
    const { date, time } = req.body;

    if (!date || !time) {
      return res.status(400).json({ message: "Date and time required" });
    }

    const reg = await Registration.findOneAndUpdate(
      { userId: req.userId },
      {
        testSlot: { date, time, started: false },
        status: "SEAT_CONFIRMED",
      },
      { new: true }
    );

    res.json({ message: "Test slot saved", reg });
  } catch (error) {
    console.error("TEST SLOT ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= COURSE PAYMENT ================= */
router.post("/course-pay", auth, async (req, res) => {
  try {
    const { transactionId } = req.body;

    if (!transactionId) {
      return res.status(400).json({ message: "Transaction ID required" });
    }

    const reg = await Registration.findOneAndUpdate(
      { userId: req.userId },
      {
        courseTxnId: transactionId,
        status: "SEAT_CONFIRMED",
      },
      { new: true }
    );

    res.json({ message: "Seat confirmed", reg });
  } catch (error) {
    console.error("COURSE PAY ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
