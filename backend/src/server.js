import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import apiRouter from './routes/api.router.js';

import { globalApiLimiter } from './middlewares/rateLimit.middleware.js';
import { handleServerError } from './utils/errorHandler.js';
import { initBackupScheduler } from './services/backupScheduler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Piercing E-commerce Platform API is running' });
});

// API Routes with Global Baseline Rate Limiter
app.use('/api', globalApiLimiter, apiRouter);

// Global Error Handler (Hides stack traces, SQL, file paths, and env vars from response)
app.use((err, req, res, next) => {
  return handleServerError(res, err, 'An unexpected internal server error occurred');
});

app.listen(PORT, () => {
  console.log(`\n=============================================================`);
  console.log(` Piercing E-commerce Backend API Server running on port ${PORT}`);
  console.log(` Health Check: http://localhost:${PORT}/health`);
  console.log(` API Base: http://localhost:${PORT}/api`);
  console.log(`=============================================================\n`);

  // Initialize automated database backup scheduler
  initBackupScheduler();
});
