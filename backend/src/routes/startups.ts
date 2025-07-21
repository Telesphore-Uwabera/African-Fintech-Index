import express from 'express';
import Startup from '../models/Startup';

const router = express.Router();

// GET /api/startups - list all startups
router.get('/', async (req, res) => {
  try {
    const startups = await Startup.find().sort({ addedAt: -1 });
    res.json(startups);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch startups' });
  }
});

// POST /api/startups - add a new startup
router.post('/', async (req, res) => {
  try {
    const startup = new Startup(req.body);
    await startup.save();
    res.status(201).json(startup);
  } catch (err) {
    res.status(400).json({ error: 'Failed to add startup' });
  }
});

export default router; 