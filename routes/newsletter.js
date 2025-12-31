import express from "express";
import Newsletter from "../models/Newsletter.js";

const router = express.Router();

// Save email to DB
router.post("/", async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const exists = await Newsletter.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already subscribed" });

    const newEmail = new Newsletter({ email });
    await newEmail.save();

    res.status(201).json({ message: "Subscribed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
