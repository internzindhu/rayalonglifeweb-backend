import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';

import logger from './middlewares/logger';
import errorHandler from './middlewares/errorHandler';
import hotelsRouter from './routes/hotels';
import inquiriesRouter from './routes/inquiries';
import consultationsRouter from './routes/consultations';
import contactsRouter from './routes/contacts';
import vouchersRouter from './routes/vouchers';
import questionnaireRouter from './routes/questionnaire';
import lookupsRouter from './routes/lookups';
import uploadsRouter from './routes/uploads';

const app = express();

// ─── Global middleware ────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/hotels', hotelsRouter);
app.use('/api/inquiries', inquiriesRouter);
app.use('/api/consultations', consultationsRouter);
app.use('/api/contacts', contactsRouter);
app.use('/api/vouchers', vouchersRouter);
app.use('/api/questionnaire', questionnaireRouter);
app.use('/api/lookups', lookupsRouter);
app.use('/api/uploads', uploadsRouter);

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ status: 404, message: 'Route not found.' });
});

// Centralised error handler
app.use(errorHandler);

export default app;
