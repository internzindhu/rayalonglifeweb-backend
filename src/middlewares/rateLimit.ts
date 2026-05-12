// Per-IP rate limiter for lead capture endpoints (inquiries, consultations, contacts, vouchers, questionnaire)

import rateLimit from 'express-rate-limit';

export const leadCaptureRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 429, message: 'Too many requests, please try again later.' },
});
