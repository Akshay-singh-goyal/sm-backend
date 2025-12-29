const express = require("express");
const router = express.Router();
const Registration = require("../models/Registration");
const auth = require("../middleware/auth");

/* =========================
   PAID COURSE REGISTRATION
   ========================= */
router.post("/", auth, async (req, res) => {
  try {
    const { batchId, transactionId } = req.body;

    if (!batchId || !transactionId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // prevent duplicate registration
    const already = await Registration.findOne({
      userId: req.user._id,
      batchId,
    });

    if (already) {
      return res.status(400).json({ message: "Already registered" });
    }

    await Registration.create({
      userId: req.user._id,
      batchId,

      paymentType: "paid",

      // registration payment
      registrationFeePaid: true,
      registrationTransactionId: transactionId,

      // course payment
      courseFeePaid: true,
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

/* =========================
   UNPAID COURSE REGISTRATION
   ========================= */
router.post("/unpaid", auth, async (req, res) => {
  try {
    const { batchId } = req.body;

    if (!batchId) {
      return res.status(400).json({ message: "Batch ID required" });
    }

    const already = await Registration.findOne({
      userId: req.user._id,
      batchId,
    });

    if (already) {
      return res.status(400).json({ message: "Already registered" });
    }

    await Registration.create({
      userId: req.user._id,
      batchId,
      paymentType: "unpaid",

      registrationFeePaid: false,
      courseFeePaid: false,

      adminApproved: false,
      testScore: null,
    });

    res.json({
      message: "Unpaid registration successful. Test will be scheduled.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================
   CHECK REGISTRATION STATUS
   ========================= */
router.get("/status/:batchId", auth, async (req, res) => {
  try {
    const reg = await Registration.findOne({
      userId: req.user._id,
      batchId: req.params.batchId,
    }).populate("userInfo");

    if (!reg) {
      return res.json({ registered: false });
    }

    res.json({
      registered: true,
      paymentType: reg.paymentType,
      adminApproved: reg.adminApproved,
      courseFeePaid: reg.courseFeePaid,
      testScore: reg.testScore,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
