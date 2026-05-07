import express from 'express';
import { findBestDevices } from '../services/geminiService';

const router = express.Router();

router.post('/find', async (req, res) => {
  const { budget, priority } = req.body;
  if (!budget || !priority) {
    return res.status(400).json({ error: 'Budget and priority are required' });
  }

  const recommendations = await findBestDevices(budget, priority);
  res.json(recommendations);
});

export default router;
