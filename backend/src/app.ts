import express from 'express';
import cors from 'cors';
import path from 'path';
import router from './routes';
import { errorHandler } from './middleware/error.middleware';

const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api', router);

// Root healthcheck
app.get('/', (_req, res) => {
  res.json({
    name: 'PlacementReady API',
    status: 'ONLINE',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.use(errorHandler);

export default app;
