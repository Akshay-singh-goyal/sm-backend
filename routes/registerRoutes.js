const express = require("express");
const Registration = require("../models/Registration");
const jwt = require("jsonwebtoken");

const router = express.Router();

// ===== Middleware: Auth =====
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No accessToken provided" });
  }

  const accessToken = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    console.error("JWT Error:", err.message);
    return res.status(401).json({ message: "Invalid accessToken" });
  }
};

// ===== Get Registration Status =====
router.get("/status/:batchId", authMiddleware, async (req, res) => {
  try {
    const registration = await Registration.findOne({
      userId: req.userId,
      batchId: req.params.batchId,
    }).populate("userInfo", "name email mobile");

    res.json(registration || { registered: false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ===== Paid Registration =====
router.post("/", authMiddleware, async (req, res) => {
  const { batchId, transactionId, amount } = req.body;

  try {
    const existing = await Registration.findOne({
      userId: req.userId,
      batchId,
    });

    if (existing) {
      return res
        .status(400)
        .json({ message: "You are already registered for this batch" });
    }

    const newReg = await Registration.create({
      userId: req.userId,
      batchId,
      paymentType: "paid",
      registrationFeePaid: true,
      registrationAmount: amount || 200,
      registrationTransactionId: transactionId,
      adminApproved: false,
    });

    await newReg.populate("userInfo", "name email mobile");

    res.json({
      message: "Paid registration done. Await admin approval.",
      registration: newReg,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ===== Unpaid Registration =====
router.post("/unpaid", authMiddleware, async (req, res) => {
  const { batchId } = req.body;

  try {
    const existing = await Registration.findOne({
      userId: req.userId,
      batchId,
    });

    if (existing) {
      return res
        .status(400)
        .json({ message: "You are already registered for this batch" });
    }

    const newReg = await Registration.create({
      userId: req.userId,
      batchId,
      paymentType: "unpaid",
      registrationFeePaid: false,
      registrationAmount: 0,
      adminApproved: false,
    });

    await newReg.populate("userInfo", "name email mobile");

    res.json({
      message: "Unpaid registration created. Book your test slot next.",
      registration: newReg,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ===== Unpaid Slot Booking (NO EMAIL / OTP) =====
router.post("/unpaid/slot", authMiddleware, async (req, res) => {
  const { batchId, slot } = req.body;

  try {
    let reg = await Registration.findOne({
      userId: req.userId,
      batchId,
      paymentType: "unpaid",
    });

    if (!reg)
      return res.status(400).json({ message: "Unpaid registration not found" });

    if (reg.testSlot)
      return res.status(400).json({ message: "Slot already booked" });

    reg.testSlot = slot;
    await reg.save();
    await reg.populate("userInfo", "name email mobile");

    res.json({
      message: "Slot booked successfully.",
      registration: reg,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ===== Submit Test (Unpaid Flow) =====
router.post("/unpaid/test", authMiddleware, async (req, res) => {
  const { batchId, testScore } = req.body;

  try {
    let reg = await Registration.findOne({
      userId: req.userId,
      batchId,
      paymentType: "unpaid",
    });

    if (!reg)
      return res.status(400).json({ message: "Registration not found" });

    reg.testScore = testScore;
    await reg.save();
    await reg.populate("userInfo", "name email mobile");

    res.json({
      message: "Test submitted. Await admin approval.",
      registration: reg,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ===== Admin Approval =====
router.post("/admin/approve/:regId", async (req, res) => {
  const { regId } = req.params;

  try {
    let reg = await Registration.findById(regId);
    if (!reg)
      return res.status(404).json({ message: "Registration not found" });

    reg.adminApproved = true;
    await reg.save();
    await reg.populate("userInfo", "name email mobile");

    res.json({
      message: "Registration approved by admin",
      registration: reg,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ===== Paid Course Fee Payment =====
router.post("/course/pay/:regId", authMiddleware, async (req, res) => {
  const { regId } = req.params;
  const { transactionId, amount } = req.body;

  try {
    let reg = await Registration.findById(regId);
    if (!reg)
      return res.status(404).json({ message: "Registration not found" });

    if (!reg.adminApproved)
      return res.status(400).json({ message: "Admin has not approved yet" });

    reg.courseFeePaid = true;
    reg.courseAmount = amount || 2000;
    reg.courseTransactionId = transactionId;

    await reg.save();
    await reg.populate("userInfo", "name email mobile");

    res.json({
      message: "Course payment successful",
      registration: reg,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
