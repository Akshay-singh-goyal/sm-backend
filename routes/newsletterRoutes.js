import express from "express";
import Subscriber from "../models/Newsletter.js";

const router = express.Router();

// POST /api/newsletter
router.post("/", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  try {
    const exists = await Subscriber.findOne({ email });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Email already subscribed",
      });
    }

    const newSubscriber = new Subscriber({ email });
    await newSubscriber.save();

    res.status(201).json({
      success: true,
      message: "Subscribed successfully",
    });
  } catch (error) {
    console.error("NEWSLETTER ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

export default router;
