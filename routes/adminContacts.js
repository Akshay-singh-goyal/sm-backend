import express from "express";
import Contact from "../models/Contact.js";
import adminAuth  from "../middleware/auth.js";

const router = express.Router();

// ✅ GET all tickets
router.get("/contacts", adminAuth, async (req, res) => {
  try {
    const tickets = await Contact.find().sort({ createdAt: -1 });
    res.json({ tickets });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching tickets" });
  }
});

// ✅ PUT reply to a ticket
router.put("/contact/:id/reply", adminAuth, async (req, res) => {
  const { id } = req.params;
  const { reply } = req.body;

  if (!reply) return res.status(400).json({ message: "Reply cannot be empty" });

  try {
    const ticket = await Contact.findById(id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    ticket.reply = reply;
    await ticket.save();

    res.json({ message: "Reply sent successfully", ticket });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error sending reply" });
  }
});

// ✅ PUT mark ticket as resolved
router.put("/contact/:id/resolve", adminAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const ticket = await Contact.findById(id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    ticket.resolved = true;
    await ticket.save();

    res.json({ message: "Ticket marked as resolved", ticket });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error resolving ticket" });
  }
});

export default router;
