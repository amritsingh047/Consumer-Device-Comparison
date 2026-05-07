import express from 'express';
import cors from 'cors';
import path from 'path';
import deviceRoutes from './routes/devices';
import compareRoutes from './routes/compare';
import aiRoutes from './routes/ai';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173'] }));
app.use(express.json());

// API routes
app.use('/api/devices', deviceRoutes);
app.use('/api/compare', compareRoutes);
app.use('/api/ai', aiRoutes);

// Serve static frontend files in production
const frontendPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendPath));

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// Catch-all to serve index.html for SPA routing
app.use((req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(frontendPath, 'index.html'));
  } else {
    res.status(404).json({ error: 'API route not found' });
  }
});

app.listen(PORT, () => console.log(`TechCompare API running on port ${PORT}`));

export default app;
