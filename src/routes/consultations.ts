// Consultations router

import { Router } from 'express';
import { z } from 'zod';
import validate from '../middlewares/validate';
import requireAdmin from '../middlewares/requireAdmin';
import { leadCaptureRateLimit } from '../middlewares/rateLimit';
import * as consultationsController from '../controllers/consultationsController';

const router = Router();

// Accepts the camelCase shape the frontend Consultation form sends.
// Snake_case keys are also accepted for backwards compatibility / admin tooling.
// The controller normalizes either shape into the service DTO.
const createConsultationSchema = z.object({
  body: z.object({
    gender:            z.string().optional(),
    name:              z.string().min(2).max(100),
    country:           z.string().optional(),
    email:             z.string().email(),
    mobile:            z.string().optional(),

    // Frontend (camelCase) keys
    preferredContact:  z.union([
                         z.string(),
                         z.array(z.string()),
                       ]).optional(),
    travelMonth:       z.string().optional(),
    budget:            z.union([z.string(), z.number()]).optional(),
    budgetCurrency:    z.string().optional(),
    numberOfNights:    z.union([z.string(), z.number()]).optional(),
    scheduleDateTime:  z.string().optional(),

    // Snake_case fallbacks
    preferred_contact: z.union([z.string(), z.array(z.string())]).optional(),
    travel_month:      z.string().optional(),
    budget_min:        z.string().optional(),
    budget_max:        z.string().optional(),
    number_of_nights:  z.union([z.string(), z.number()]).optional(),
    schedule_datetime: z.string().optional(),

    comment:           z.string().max(2000).optional(),
  }).passthrough(),
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
