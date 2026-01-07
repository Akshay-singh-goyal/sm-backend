import express from "express";
import Contact from "../models/Contact.js";

const router = express.Router();

/**
 * =====================================================
 * CREATE TICKET (User)
 * POST /api/contact
 * =====================================================
 */
router.post("/", async (req, res) => {
  try {
    const { name, email, category, priority, subject, message } = req.body;

    // Validation (from both codes)
    if (!name || !email || !subject) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing: name, email, and subject are required",
      });
    }

    // Create ticket (merged logic)
    const ticket = await Contact.create({
      name,
      email: email.toLowerCase(),
      category: category || "Other",
      priority: priority || "Medium",
      subject,
      message,
    });

    res.status(201).json({
      success: true,
      message: "Message received successfully",
      ticket,
    });
  } catch (error) {
    console.error("CONTACT ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/**
 * =====================================================
 * FETCH USER TICKETS
 * GET /api/contact/user-tickets?email=
 * =====================================================
 */
router.get("/user-tickets", async (req, res) => {
  try {
    const email = req.query.email?.toLowerCase();

    // Validation (merged)
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required to fetch tickets",
      });
    }

    const tickets = await Contact.find({ email }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Tickets fetched successfully",
      tickets,
    });
  } catch (err) {
    console.error("FETCH USER TICKETS ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

export default router;
