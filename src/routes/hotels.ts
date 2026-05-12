// Hotels router — public read + admin write endpoints

import { Router } from 'express';
import { z } from 'zod';
import validate from '../middlewares/validate';
import requireAdmin from '../middlewares/requireAdmin';
import * as hotelsController from '../controllers/hotelsController';
import * as inquiriesController from '../controllers/inquiriesController';

const router = Router();

// ─── Validation schemas ───────────────────────────────────────────────────────

const uuidParam = z.object({
  params: z.object({ id: z.string().uuid('id must be a valid UUID') }),
  query: z.object({}).passthrough(),
  body: z.object({}).passthrough(),
});

const listHotelsSchema = z.object({
  query: z.object({
    location:           z.string().optional(),
    property_type:      z.enum(['Ayurveda Only', 'Wellness', 'Leisure']).optional(),
    ownership_type:     z.enum(['Individual', 'Group']).optional(),
    hotel_style_id:     z.string().regex(/^\d+$/).optional(),
    min_nights:         z.string().regex(/^\d+$/).optional(),
    max_nights:         z.string().regex(/^\d+$/).optional(),
    max_occupancy:      z.string().regex(/^\d+$/).optional(),
    kid_friendly:       z.enum(['true', 'false']).optional(),
    doctors_available:  z.enum(['true', 'false']).optional(),
    medical_report_support: z.enum(['true', 'false']).optional(),
    facilities:         z.string().optional(),
    activities:         z.string().optional(),
    meal_plans:         z.string().optional(),
    cuisine_types:      z.string().optional(),
    dining_features:    z.string().optional(),
    room_features:      z.string().optional(),
    restrictions:       z.string().optional(),
    wellness_offerings: z.string().optional(),
    setting_types:      z.string().optional(),
    property_types:     z.string().optional(),
    sort_by:            z.enum(['name', 'created_at', 'rating', 'price']).optional(),
    sort_order:         z.enum(['asc', 'desc']).optional(),
    page:               z.string().regex(/^\d+$/).optional(),
    limit:              z.string().regex(/^\d+$/).optional(),
  }),
  body: z.object({}).optional(),
  params: z.object({}).optional(),
});

const idsArray = z.array(z.number().int().positive()).optional();

const createHotelSchema = z.object({
  body: z.object({
    name:                    z.string().min(1),
    website:                 z.string().url().optional(),
    location:                z.string().optional(),
    address:                 z.string().optional(),
    chain_name:              z.string().optional(),
    marketing_material:      z.record(z.unknown()).optional(),
    property_type:           z.enum(['Ayurveda Only', 'Wellness', 'Leisure']).optional(),
    min_nights:              z.number().int().min(0).optional(),
    rooms_count:             z.number().int().min(0).optional(),
    max_occupancy:           z.number().int().min(0).optional(),
    doctors_count:           z.number().int().min(0).optional(),
    medical_report_support:  z.boolean().optional(),
    kid_friendly:            z.boolean().optional(),
    min_age:                 z.number().int().min(0).optional(),
    ownership_type:          z.enum(['Individual', 'Group']).optional(),
    star_classification:     z.string().optional(),
    no_min_nights:           z.boolean().optional(),
    doctors_available:       z.boolean().optional(),
    consultation_time:       z.string().optional(),
    pricing_notes:           z.string().optional(),
    commission_rate:         z.string().optional(),
    rates_currency:          z.string().optional(),
    contact_name:            z.string().optional(),
    contact_number:          z.string().optional(),
    contact_email:           z.string().email().optional(),
    transfers_info:          z.string().optional(),
    sustainability_csr:      z.string().optional(),
    remarks:                 z.string().optional(),
    data_fed_by:             z.string().optional(),
    hotel_style_id:          z.number().int().positive().optional(),
    description:             z.string().optional(),
    images:                  z.array(z.string().url()).optional(),
    price:                   z.string().optional(),
    slogan_line:             z.string().optional(),
    rating:                  z.number().min(0).max(5).optional(),
    reviews_count:           z.number().int().min(0).optional(),
    is_active:               z.boolean().optional(),
    facility_ids:            idsArray,
    activity_ids:            idsArray,
    meal_plan_ids:           idsArray,
    cuisine_type_ids:        idsArray,
    dining_feature_ids:      idsArray,
    room_feature_ids:        idsArray,
    restriction_ids:         idsArray,
    wellness_offering_ids:   idsArray,
    setting_type_ids:        idsArray,
    property_type_ids:       idsArray,
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

const patchStatusSchema = z.object({
  body: z.object({
    status: z.enum(['new', 'contacted', 'confirmed', 'cancelled']),
  }),
  query: z.object({}).optional(),
  params: z.object({ id: z.string().uuid() }),
});

// ─── Public routes ────────────────────────────────────────────────────────────

router.get('/', validate(listHotelsSchema), hotelsController.listHotels);
router.get('/:id', validate(uuidParam), hotelsController.getHotel);
router.get('/:id/related', validate(uuidParam), hotelsController.getRelatedHotels);

// Admin — hotel inquiries convenience query
router.get('/:hotelId/inquiries', requireAdmin, inquiriesController.listInquiriesByHotel);

// ─── Admin routes ─────────────────────────────────────────────────────────────

router.post('/', requireAdmin, validate(createHotelSchema), hotelsController.createHotel);
router.put('/:id', requireAdmin, validate(uuidParam), hotelsController.updateHotel);
router.delete('/:id', requireAdmin, validate(uuidParam), hotelsController.deleteHotel);

export default router;
