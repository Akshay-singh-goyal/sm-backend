const express = require("express");
const Registration = require("../models/Registration");
const jwt = require("jsonwebtoken");

const router = express.Router();

/* ================= AUTH MIDDLEWARE ================= */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No accessToken provided" });
  }

  const accessToken = authHeader.split(" ")[1];

  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET missing in env");
    return res.status(500).json({ message: "Server configuration error" });
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    console.error("JWT Error:", err.message);
    return res.status(401).json({ message: "Invalid accessToken" });
  }
};

/* ================= GET REGISTRATION STATUS ================= */
router.get("/status/:batchId", authMiddleware, async (req, res) => {
  try {
    const registration = await Registration.findOne({
      userId: req.userId,
      batchId: req.params.batchId,
    }).populate("userInfo", "name email mobile");

    res.json(registration || { registered: false });
  } catch (err) {
    console.error("Status Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= PAID REGISTRATION ================= */
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
    console.error("Paid Registration Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= UNPAID REGISTRATION ================= */
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
    console.error("Unpaid Registration Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= UNPAID SLOT BOOKING ================= */
router.post("/unpaid/slot", authMiddleware, async (req, res) => {
  const { batchId, slot } = req.body;

  try {
    const reg = await Registration.findOne({
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
    console.error("Slot Booking Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= SUBMIT TEST ================= */
router.post("/unpaid/test", authMiddleware, async (req, res) => {
  const { batchId, testScore } = req.body;

  try {
    const reg = await Registration.findOne({
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
    console.error("Test Submit Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= ADMIN APPROVAL ================= */
/* ⚠️ NOTE: This route should be protected by admin auth in future */
router.post("/admin/approve/:regId", async (req, res) => {
  const { regId } = req.params;

  try {
    const reg = await Registration.findById(regId);
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
    console.error("Admin Approval Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= COURSE PAYMENT ================= */
router.post("/course/pay/:regId", authMiddleware, async (req, res) => {
  const { regId } = req.params;
  const { transactionId, amount } = req.body;

  try {
    const reg = await Registration.findById(regId);
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
    console.error("Course Payment Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
