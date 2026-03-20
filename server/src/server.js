import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { logger } from './logger.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Car Rental API is running' });
});

app.post('/api/bookings', (req, res) => {
  const booking = req.body;
  logger.info({ booking }, 'Received booking');

  res.status(201).json({
    success: true,
    message: 'Booking received',
    bookingId: `BK${Date.now()}`,
    data: booking
  });
});

app.get('/api/bookings', (req, res) => {
  res.json({ success: true, bookings: [] });
});

// Start server
app.listen(PORT, () => {
  logger.info(`Backend server running on http://localhost:${PORT}`);
  logger.info(`API Health: http://localhost:${PORT}/api/health`);
});
