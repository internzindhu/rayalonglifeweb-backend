// Inquiries router

import { Router } from 'express';
import { z } from 'zod';
import validate from '../middlewares/validate';
import requireAdmin from '../middlewares/requireAdmin';
import { leadCaptureRateLimit } from '../middlewares/rateLimit';
import * as inquiriesController from '../controllers/inquiriesController';

const router = Router();

const createInquirySchema = z.object({
  body: z.object({
    hotel_id:       z.string().uuid().optional(),
    hotel_name:     z.string().min(1),
    date_from:      z.string().date().optional(),
    date_to:        z.string().date().optional(),
    room_type:      z.enum(['Single', 'Double']).optional(),
    people:         z.number().int().min(1).optional(),
    transport_mode: z.string().optional(),
    flight_included:z.enum(['Included', 'Not included']).optional(),
    extras:         z.string().optional(),
    total_price:    z.string().optional(),
    gender:         z.string().optional(),
    full_name:      z.string().min(2).max(100),
    email:          z.string().email(),
    country:        z.string().optional(),
    mobile:         z.string().optional(),
    comment:        z.string().max(2000).optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

const statusSchema = z.object({
  body: z.object({ status: z.enum(['new', 'contacted', 'confirmed', 'cancelled']) }),
  query: z.object({}).optional(),
  params: z.object({ id: z.string().uuid() }),
});

router.post('/', leadCaptureRateLimit, validate(createInquirySchema), inquiriesController.createInquiry);
router.get('/', requireAdmin, inquiriesController.listInquiries);
router.patch('/:id/status', requireAdmin, validate(statusSchema), inquiriesController.updateInquiryStatus);

export default router;
