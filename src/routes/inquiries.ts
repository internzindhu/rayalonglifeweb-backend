// Inquiries router

import { Router } from 'express';
import { z } from 'zod';
import validate from '../middlewares/validate';
import requireAdmin from '../middlewares/requireAdmin';
import { leadCaptureRateLimit } from '../middlewares/rateLimit';
import * as inquiriesController from '../controllers/inquiriesController';

const router = Router();

// Accepts the nested shape the frontend sends:
//   { booking: { dateFrom, dateTo, roomType, people, transportMode, flightIncluded, extras, totalPrice, gender? },
//     personal: { gender, fullName, email, country, mobile, comment },
//     hotelName, hotelId? }
// The controller flattens this to the DB DTO. Snake_case top-level fields are
// also accepted for backwards compatibility / admin tooling.
const bookingSchema = z.object({
  dateFrom:        z.string().optional(),
  dateTo:          z.string().optional(),
  roomType:        z.string().optional(),
  people:          z.union([z.number(), z.string()]).optional(),
  transportMode:   z.string().optional(),
  flightIncluded:  z.string().optional(),
  extras:          z.string().optional(),
  totalPrice:      z.string().optional(),
  gender:          z.string().optional(),
}).passthrough().optional();

const personalSchema = z.object({
  gender:    z.string().optional(),
  fullName:  z.string().min(2).max(100).optional(),
  email:     z.string().email().optional(),
  country:   z.string().optional(),
  mobile:    z.string().optional(),
  comment:   z.string().max(2000).optional(),
}).passthrough().optional();

const createInquirySchema = z.object({
  body: z.object({
    // Nested (frontend) shape
    booking:   bookingSchema,
    personal:  personalSchema,
    hotelName: z.string().optional(),
    hotelId:   z.string().uuid().optional(),

    // Flat (legacy / direct) shape
    hotel_id:       z.string().uuid().optional(),
    hotel_name:     z.string().optional(),
    date_from:      z.string().optional(),
    date_to:        z.string().optional(),
    room_type:      z.string().optional(),
    people:         z.union([z.number(), z.string()]).optional(),
    transport_mode: z.string().optional(),
    flight_included:z.string().optional(),
    extras:         z.string().optional(),
    total_price:    z.string().optional(),
    gender:         z.string().optional(),
    full_name:      z.string().optional(),
    email:          z.string().email().optional(),
    country:        z.string().optional(),
    mobile:         z.string().optional(),
    comment:        z.string().max(2000).optional(),
  }).passthrough(),
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
