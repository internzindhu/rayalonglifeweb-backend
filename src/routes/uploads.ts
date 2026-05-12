// Uploads router — hotel image management via Supabase Storage

import { Router } from 'express';
import multer from 'multer';
import requireAdmin from '../middlewares/requireAdmin';
import * as uploadsController from '../controllers/uploadsController';
import { AppError } from '../middlewares/errorHandler';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError('Only jpeg, png, webp, and gif files are allowed.', 400));
    }
  },
});

router.post(
  '/hotel-image',
  requireAdmin,
  upload.single('file'),
  uploadsController.uploadHotelImage,
);

router.delete('/hotel-image', requireAdmin, uploadsController.deleteHotelImage);

export default router;
