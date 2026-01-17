import express from "express";
import Subscriber from "../models/Newsletter.js";

const router = express.Router();

/*
  POST /api/newsletter
*/
router.post("/", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    const alreadySubscribed = await Subscriber.findOne({ email });

    if (alreadySubscribed) {
      return res.status(400).json({
        success: false,
        message: "Email already subscribed"
      });
    }

    await Subscriber.create({ email });

    return res.status(201).json({
      success: true,
      message: "Subscribed successfully"
    });
  } catch (error) {
    console.error("NEWSLETTER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

export default router;
