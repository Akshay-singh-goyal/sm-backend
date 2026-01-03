// routes/studyNotesRoutes.js
import express from "express";
import Note from "../models/Note.js";
import mongoose from "mongoose";

const router = express.Router();

/**
 * GET /api/study-notes
 * Fetch all notes with optional filters:
 * - university (ObjectId)
 * - department
 * - branch
 * - subject
 * - subjectCode
 * - language
 */
router.get("/", async (req, res) => {
  try {
    const filters = {};

    // Only include query params when truthy (not empty)
    if (req.query.university) {
      // Validate ObjectId if provided
      if (mongoose.Types.ObjectId.isValid(req.query.university)) {
        filters.university = req.query.university;
      }
    }
    if (req.query.department) filters.department = req.query.department;
    if (req.query.branch) filters.branch = req.query.branch;
    if (req.query.subject) filters.subjectName = req.query.subject;
    if (req.query.subjectCode) filters.subjectCode = req.query.subjectCode;
    if (req.query.language) filters.language = req.query.language;

    const notes = await Note.find(filters)
      .populate("university", "name") // populate only university name
      .sort({ createdAt: -1 }); // optionally sort by newest first

    res.json(notes);
  } catch (err) {
    console.error("FETCH STUDY NOTES ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /api/study-notes/:id
 * Fetch a single note by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid note ID" });
    }

    const note = await Note.findById(id).populate("university", "name");
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.json(note);
  } catch (err) {
    console.error("FETCH NOTE BY ID ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST /api/study-notes
 * Create a new note
 */
router.post("/", async (req, res) => {
  try {
    const note = new Note(req.body);
    await note.save();

    // populate before returning
    await note.populate("university", "name");

    res.status(201).json(note);
  } catch (err) {
    console.error("CREATE NOTE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * PUT /api/study-notes/:id
 * Update note by ID
 */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid note ID" });
    }

    const updatedNote = await Note.findByIdAndUpdate(id, req.body, {
      new: true,
    }).populate("university", "name");

    if (!updatedNote) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.json(updatedNote);
  } catch (err) {
    console.error("UPDATE NOTE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * DELETE /api/study-notes/:id
 * Delete note by ID
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid note ID" });
    }

    const deleted = await Note.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.json({ message: "Note deleted successfully" });
  } catch (err) {
    console.error("DELETE NOTE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
