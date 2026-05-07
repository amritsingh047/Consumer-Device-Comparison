import { Router, Request, Response } from 'express';
import { mockDevices } from '../data/mockDevices';

const router = Router();

router.post('/', (req: Request, res: Response) => {
  const { deviceIds } = req.body as { deviceIds: string[] };
  if (!deviceIds || !Array.isArray(deviceIds) || deviceIds.length < 2) {
    return res.status(400).json({ error: 'Provide at least 2 device IDs' });
  }
  const devices = deviceIds.map(id => mockDevices.find(d => d.id === id)).filter(Boolean);
  res.json(devices);
});

export default router;
