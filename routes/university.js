// routes/university.js
import express from 'express';
import University from '../models/University.js';

const router = express.Router();

/* ===== CREATE ===== */
router.post('/', async (req, res) => {
  try {
    const { name, department, subjects } = req.body;
    const university = new University({ name, department, subjects });
    await university.save();
    res.status(201).json(university);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ===== READ ALL ===== */
router.get('/', async (req, res) => {
  try {
    const universities = await University.find();
    res.json(universities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ===== READ SINGLE ===== */
router.get('/:id', async (req, res) => {
  try {
    const university = await University.findById(req.params.id);
    if (!university) return res.status(404).json({ error: 'University not found' });
    res.json(university);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ===== UPDATE ===== */
router.put('/:id', async (req, res) => {
  try {
    const { name, department, subjects } = req.body;
    const updatedUniversity = await University.findByIdAndUpdate(
      req.params.id,
      { name, department, subjects },
      { new: true } // returns updated document
    );
    if (!updatedUniversity) return res.status(404).json({ error: 'University not found' });
    res.json(updatedUniversity);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ===== DELETE ===== */
router.delete('/:id', async (req, res) => {
  try {
    const deletedUniversity = await University.findByIdAndDelete(req.params.id);
    if (!deletedUniversity) return res.status(404).json({ error: 'University not found' });
    res.json({ message: 'University deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
