// routes/notesRoutes.js
import express from "express";
import mongoose from "mongoose";
import University from "../models/University.js";
import Note from "../models/Note.js"; // Note model

const router = express.Router();

/**
 * GET /api/notes/universities
 * Return all universities (for Autocomplete)
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
 * GET /api/notes
 * Return all notes.
 * Optionally supports query filters like
 *   ?university=xxx&department=yyy&branch=zzz
 */
router.get("/", async (req, res) => {
  try {
    // Build filters from query params
    const filters = {};

    if (req.query.university) filters.university = req.query.university;
    if (req.query.department) filters.department = req.query.department;
    if (req.query.branch) filters.branch = req.query.branch;
    if (req.query.subjectName) filters.subjectName = req.query.subjectName;
    if (req.query.subjectCode) filters.subjectCode = req.query.subjectCode;
    if (req.query.language) filters.language = req.query.language;

    const notes = await Note.find(filters).populate("university");
    res.json(notes);
  } catch (err) {
    console.error("Fetch notes error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/notes
 * Create a new note
 */
router.post("/", async (req, res) => {
  try {
    const note = new Note(req.body);
    await note.save();

    // Populate university before returning
    await note.populate("university");

    res.status(201).json(note);
  } catch (err) {
    console.error("Create note error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/notes/:id
 * Update a note by ID
 */
router.put("/:id", async (req, res) => {
  try {
    const updatedNote = await Note.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate("university");

    res.json(updatedNote);
  } catch (err) {
    console.error("Update note error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/notes/:id
 * Delete a note by ID
 */
router.delete("/:id", async (req, res) => {
  try {
    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: "Note deleted successfully" });
  } catch (err) {
    console.error("Delete note error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
