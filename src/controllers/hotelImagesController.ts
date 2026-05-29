// Hotel images controller — maps HTTP requests to hotelImagesService calls

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middlewares/errorHandler';
import * as hotelImagesService from '../services/hotelImagesService';

export async function listImages(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const images = await hotelImagesService.listImages(req.params.hotelId);
    res.status(200).json({ success: true, data: images });
  } catch (err) {
    next(err);
  }
}

export async function addImage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.file) throw new AppError('No file provided.', 400);

    const dto = {
      is_primary:  req.body.is_primary === 'true' || req.body.is_primary === true,
      sort_order:  req.body.sort_order !== undefined ? parseInt(req.body.sort_order, 10) : undefined,
      caption:     req.body.caption   ?? undefined,
      alt_text:    req.body.alt_text  ?? undefined,
    };

    const image = await hotelImagesService.addImage(
      req.params.hotelId,
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      dto,
    );

    res.status(201).json({ success: true, data: image });
  } catch (err) {
    next(err);
  }
}

export async function updateImage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const image = await hotelImagesService.updateImage(
      req.params.hotelId,
      req.params.imageId,
      req.body,
    );
    res.status(200).json({ success: true, data: image });
  } catch (err) {
    next(err);
  }
}

export async function deleteImage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await hotelImagesService.deleteImage(req.params.hotelId, req.params.imageId);
    res.status(200).json({ success: true, message: 'Image deleted.' });
  } catch (err) {
    next(err);
  }
}

export async function reorderImages(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const images = await hotelImagesService.reorderImages(req.params.hotelId, req.body.items);
    res.status(200).json({ success: true, data: images });
  } catch (err) {
    next(err);
  }
}
