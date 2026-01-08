import express from "express";
import mongoose from "mongoose";
import University from "../models/University.js";
import Note from "../models/Note.js";

const router = express.Router();

/**
 * ===============================
 * GET /api/notes/universities
 * ===============================
 * Return all universities (Autocomplete support)
 */
router.get("/universities", async (req, res) => {
  try {
    const universities = await University.find();
    res.json(universities);
  } catch (err) {
    console.error("Fetch universities error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * ===============================
 * GET /api/notes
 * ===============================
 * Supports filters:
 * ?university=
 * ?subjectName=
 * ?language=
 * ?subjectCode=
 * ?branch=
 * ?department=
 */
router.get("/", async (req, res) => {
  try {
    const filters = {};

    // Direct fields
    if (req.query.university) {
      if (mongoose.Types.ObjectId.isValid(req.query.university)) {
        filters.university = req.query.university;
      }
    }

    if (req.query.subjectName) {
      filters.subjectName = req.query.subjectName;
    }

    if (req.query.language) {
      filters.language = req.query.language;
    }

    // Nested array fields (IMPORTANT FIX)
    if (
      req.query.subjectCode ||
      req.query.branch ||
      req.query.department
    ) {
      filters.subjectCodes = {
        $elemMatch: {},
      };

      if (req.query.subjectCode) {
        filters.subjectCodes.$elemMatch.code = req.query.subjectCode;
      }

      if (req.query.branch) {
        filters.subjectCodes.$elemMatch.branch = req.query.branch;
      }

      if (req.query.department) {
        filters.subjectCodes.$elemMatch.department =
          req.query.department;
      }
    }

    const notes = await Note.find(filters).populate("university");
    res.json(notes);
  } catch (err) {
    console.error("Fetch notes error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * ===============================
 * POST /api/notes
 * ===============================
 * Create a new note
 */
router.post("/", async (req, res) => {
  try {
    const {
      university,
      subjectName,
      subjectCodes,
      year,
      semester,
      topicName,
      topicDetails,
      language,
    } = req.body;

    // Basic validation
    if (!university || !mongoose.Types.ObjectId.isValid(university)) {
      return res.status(400).json({
        error: "Valid university ID is required",
      });
    }

    if (!subjectName) {
      return res.status(400).json({
        error: "Subject name is required",
      });
    }

    if (!Array.isArray(subjectCodes) || subjectCodes.length === 0) {
      return res.status(400).json({
        error: "At least one subject code is required",
      });
    }

    const note = new Note({
      university,
      subjectName,
      subjectCodes,
      year,
      semester,
      topicName,
      topicDetails,
      language,
    });

    await note.save();
    await note.populate("university");

    res.status(201).json(note);
  } catch (err) {
    console.error("Create note error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * ===============================
 * PUT /api/notes/:id
 * ===============================
 * Update note
 */
router.put("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        error: "Invalid note ID",
      });
    }

    const updatedNote = await Note.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("university");

    if (!updatedNote) {
      return res.status(404).json({
        error: "Note not found",
      });
    }

    res.json(updatedNote);
  } catch (err) {
    console.error("Update note error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * ===============================
 * DELETE /api/notes/:id
 * ===============================
 * Delete note
 */
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        error: "Invalid note ID",
      });
    }

    const deleted = await Note.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        error: "Note not found",
      });
    }

    res.json({ message: "Note deleted successfully" });
  } catch (err) {
    console.error("Delete note error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
