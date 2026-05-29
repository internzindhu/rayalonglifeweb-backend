// Hotels router — public read + admin write endpoints

import { Router } from 'express';
import { z } from 'zod';
import multer from 'multer';
import validate from '../middlewares/validate';
import requireAdmin from '../middlewares/requireAdmin';
import { AppError } from '../middlewares/errorHandler';
import * as hotelsController from '../controllers/hotelsController';
import * as hotelImagesController from '../controllers/hotelImagesController';
import * as inquiriesController from '../controllers/inquiriesController';

const router = Router();

// ─── Multer (image uploads on hotel routes) ───────────────────────────────────

const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError('Only jpeg, png, webp, and gif files are allowed.', 400));
    }
  },
});

// ─── Validation schemas ───────────────────────────────────────────────────────

const uuidParam = z.object({
  params: z.object({ id: z.string().uuid('id must be a valid UUID') }),
  query:  z.object({}).passthrough(),
  body:   z.object({}).passthrough(),
});

const hotelImageParams = z.object({
  params: z.object({
    hotelId: z.string().uuid('hotelId must be a valid UUID'),
  }),
  query: z.object({}).passthrough(),
  body:  z.object({}).passthrough(),
});

const hotelImageWithIdParams = z.object({
  params: z.object({
    hotelId: z.string().uuid(),
    imageId: z.string().uuid(),
  }),
  query: z.object({}).passthrough(),
  body:  z.object({}).passthrough(),
});

const listHotelsSchema = z.object({
  query: z.object({
    location:               z.string().optional(),
    hotel_style_id:         z.string().regex(/^\d+$/).optional(),
    min_nights:             z.string().regex(/^\d+$/).optional(),
    max_nights:             z.string().regex(/^\d+$/).optional(),
    max_occupancy:          z.string().regex(/^\d+$/).optional(),
    kid_friendly:           z.enum(['true', 'false']).optional(),
    doctors_available:      z.enum(['true', 'false']).optional(),
    medical_report_support: z.enum(['true', 'false']).optional(),
    facilities:             z.string().optional(),
    activities:             z.string().optional(),
    meal_plans:             z.string().optional(),
    cuisine_types:          z.string().optional(),
    dining_features:        z.string().optional(),
    room_features:          z.string().optional(),
    restrictions:           z.string().optional(),
    wellness_offerings:     z.string().optional(),
    setting_types:          z.string().optional(),
    property_types:         z.string().optional(),
    sort_by:                z.enum(['name', 'created_at', 'rating', 'price']).optional(),
    sort_order:             z.enum(['asc', 'desc']).optional(),
    page:                   z.string().regex(/^\d+$/).optional(),
    limit:                  z.string().regex(/^\d+$/).optional(),
  }),
  body:   z.object({}).optional(),
  params: z.object({}).optional(),
});

const idsArray = z.array(z.number().int().positive()).optional();

const createHotelSchema = z.object({
  body: z.object({
    name:                    z.string().min(1),
    website:                 z.string().optional(),
    location:                z.string().optional(),
    address:                 z.string().optional(),
    chain_name:              z.string().optional(),
    marketing_material:      z.record(z.unknown()).optional(),
    google_maps_url:         z.string().url().optional(),
    // Scalar filter fields
    min_nights:              z.number().int().min(0).optional(),
    no_min_nights:           z.boolean().optional(),
    rooms_count:             z.number().int().min(0).optional(),
    max_occupancy:           z.number().int().min(0).optional(),
    doctors_count:           z.number().int().min(0).optional(),
    doctors_available:       z.boolean().optional(),
    medical_report_support:  z.boolean().optional(),
    kid_friendly:            z.boolean().optional(),
    min_age:                 z.number().int().min(0).optional(),
    // Raw text
    property_type_raw:       z.string().optional(),
    min_nights_raw:          z.string().optional(),
    rooms_raw:               z.string().optional(),
    doctors_raw:             z.string().optional(),
    min_age_raw:             z.string().optional(),
    restrictions_raw:        z.string().optional(),
    facilities_raw:          z.string().optional(),
    activities_raw:          z.string().optional(),
    cuisine_raw:             z.string().optional(),
    meal_plan_raw:           z.string().optional(),
    dining_features_raw:     z.string().optional(),
    // Editorial
    description:             z.string().optional(),
    slogan_line:             z.string().optional(),
    unique_features:         z.string().optional(),
    highlights:              z.array(z.string()).optional(),
    price:                   z.string().optional(),
    rating:                  z.number().min(0).max(5).optional(),
    reviews_count:           z.number().int().min(0).optional(),
    video_url:               z.string().url().optional(),
    remarks:                 z.string().optional(),
    hotel_style_id:          z.number().int().positive().optional(),
    is_active:               z.boolean().optional(),
    // Junction IDs
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
  query:  z.object({}).optional(),
  params: z.object({}).optional(),
});

const updateImageSchema = z.object({
  params: z.object({ hotelId: z.string().uuid(), imageId: z.string().uuid() }),
  body: z.object({
    is_primary:  z.boolean().optional(),
    sort_order:  z.number().int().min(0).optional(),
    caption:     z.string().max(500).optional(),
    alt_text:    z.string().max(300).optional(),
  }),
  query: z.object({}).passthrough(),
});

const reorderImagesSchema = z.object({
  params: z.object({ hotelId: z.string().uuid() }),
  body: z.object({
    items: z.array(z.object({
      id:         z.string().uuid(),
      sort_order: z.number().int().min(0),
    })).min(1),
  }),
  query: z.object({}).passthrough(),
});

// ─── Public routes ────────────────────────────────────────────────────────────

router.get('/',            validate(listHotelsSchema), hotelsController.listHotels);
router.get('/:id',         validate(uuidParam),        hotelsController.getHotel);
router.get('/:id/related', validate(uuidParam),        hotelsController.getRelatedHotels);

// Hotel gallery — public read
router.get('/:hotelId/images', validate(hotelImageParams), hotelImagesController.listImages);

// Admin — hotel inquiries convenience query
router.get('/:hotelId/inquiries', requireAdmin, inquiriesController.listInquiriesByHotel);

// ─── Admin routes ─────────────────────────────────────────────────────────────

router.post('/', validate(createHotelSchema), hotelsController.createHotel);
router.put('/:id', validate(uuidParam),         hotelsController.updateHotel);
router.delete('/:id', requireAdmin, validate(uuidParam),       hotelsController.deleteHotel);

// Hotel gallery — admin write
router.post(
  '/:hotelId/images',
  validate(hotelImageParams),
  upload.single('file'),
  hotelImagesController.addImage,
);
router.patch(
  '/:hotelId/images/:imageId',
  validate(updateImageSchema),
  hotelImagesController.updateImage,
);
router.delete(
  '/:hotelId/images/:imageId',
  requireAdmin,
  validate(hotelImageWithIdParams),
  hotelImagesController.deleteImage,
);
router.put(
  '/:hotelId/images/reorder',
  validate(reorderImagesSchema),
  hotelImagesController.reorderImages,
);

export default router;
