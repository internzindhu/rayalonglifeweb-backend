// Consultations router

import { Router } from 'express';
import { z } from 'zod';
import validate from '../middlewares/validate';
import requireAdmin from '../middlewares/requireAdmin';
import { leadCaptureRateLimit } from '../middlewares/rateLimit';
import * as consultationsController from '../controllers/consultationsController';

const router = Router();

const createConsultationSchema = z.object({
  body: z.object({
    gender:            z.string().optional(),
    name:              z.string().min(2).max(100),
    country:           z.string().optional(),
    email:             z.string().email(),
    mobile:            z.string().optional(),
    preferred_contact: z.enum(['call', 'whatsapp', 'email']).optional(),
    travel_month:      z.string().optional(),
    budget_min:        z.string().optional(),
    budget_max:        z.string().optional(),
    number_of_nights:  z.number().int().min(1).optional(),
    schedule_datetime: z.string().datetime({ offset: true }).optional(),
    comment:           z.string().max(2000).optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

const statusSchema = z.object({
  body: z.object({ status: z.enum(['new', 'in_progress', 'closed']) }),
  query: z.object({}).optional(),
  params: z.object({ id: z.string().uuid() }),
});

router.post('/', leadCaptureRateLimit, validate(createConsultationSchema), consultationsController.createConsultation);
router.get('/', requireAdmin, consultationsController.listConsultations);
router.patch('/:id/status', requireAdmin, validate(statusSchema), consultationsController.updateConsultationStatus);

export default router;
