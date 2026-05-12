// Uploads controller — handles hotel image upload/delete via Supabase Storage

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middlewares/errorHandler';
import * as uploadsService from '../services/uploadsService';

export async function uploadHotelImage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.file) throw new AppError('No file provided.', 400);
    const result = await uploadsService.uploadHotelImage(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
    );
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function deleteHotelImage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { path } = req.body as { path?: string };
    if (!path) throw new AppError('path is required.', 400);
    await uploadsService.deleteHotelImage(path);
    res.status(200).json({ success: true, message: 'Image deleted.' });
  } catch (err) {
    next(err);
  }
}
