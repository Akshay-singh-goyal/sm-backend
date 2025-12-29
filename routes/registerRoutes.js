const express = require("express");
const router = express.Router();
const Registration = require("../models/Registration");
const auth = require("../middleware/auth");

/* =====================================
   PAID COURSE REGISTRATION (₹2000)
===================================== */
router.post("/", auth, async (req, res) => {
  try {
    const { batchId, transactionId } = req.body;

    if (!batchId || !transactionId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existing = await Registration.findOne({
      userId: req.user._id,
      batchId,
    });

    if (existing) {
      return res.status(400).json({ message: "Already registered" });
    }

    await Registration.create({
      userId: req.user._id,
      batchId,
      paymentType: "paid",

      registrationFeePaid: true,
      courseFeePaid: true,

      registrationTransactionId: transactionId,
      courseTransactionId: transactionId,

      transactionId,
      adminApproved: false,
    });

    res.json({
      message: "Paid registration successful. Waiting for admin approval.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =====================================
   UNPAID REGISTRATION (₹200 REG FEE)
===================================== */
router.post("/unpaid", auth, async (req, res) => {
  try {
    const { batchId, transactionId } = req.body;

    if (!batchId || !transactionId) {
      return res.status(400).json({ message: "BatchId & transactionId required" });
    }

    const existing = await Registration.findOne({
      userId: req.user._id,
      batchId,
    });

    if (existing) {
      return res.status(400).json({ message: "Already registered" });
    }

    await Registration.create({
      userId: req.user._id,
      batchId,
      paymentType: "unpaid",

      registrationFeePaid: false, // admin will verify
      registrationTransactionId: transactionId,

      courseFeePaid: false,
      adminApproved: false,

      transactionId,
    });

    res.json({
      message: "Registration fee submitted. Waiting for admin approval.",
      status: "WAITING",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =====================================
   CHECK REGISTRATION STATUS
===================================== */
router.get("/status/:batchId", auth, async (req, res) => {
  try {
    const reg = await Registration.findOne({
      userId: req.user._id,
      batchId: req.params.batchId,
    });

    if (!reg) {
      return res.json({ status: "NOT_REGISTERED" });
    }

    if (!reg.adminApproved) {
      return res.json({ status: "WAITING" });
    }

    if (reg.paymentType === "unpaid" && !reg.testSlot) {
      return res.json({ status: "APPROVED_WAITING_TEST" });
    }

    if (reg.testSlot) {
      return res.json({
        status: "TEST_SCHEDULED",
        testSlot: reg.testSlot,
      });
    }

    res.json({ status: "UNKNOWN" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =====================================
   SET TEST SLOT (UNPAID FLOW)
===================================== */
router.post("/test-slot", auth, async (req, res) => {
  try {
    const { batchId, testSlot } = req.body;

    const reg = await Registration.findOne({
      userId: req.user._id,
      batchId,
      paymentType: "unpaid",
      adminApproved: true,
    });

    if (!reg) {
      return res.status(400).json({ message: "Not eligible for test" });
    }

    reg.testSlot = testSlot;
    await reg.save();

    res.json({ message: "Test slot booked successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
