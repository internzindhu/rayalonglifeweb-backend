// Hotel images controller — maps HTTP requests to hotelImagesService calls

import { Request, Response, NextFunction } from 'express';
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
    const dto = {
      url:         req.body.url        as string,
      is_primary:  req.body.is_primary ?? false,
      sort_order:  req.body.sort_order,
      caption:     req.body.caption,
      alt_text:    req.body.alt_text,
    };

    const image = await hotelImagesService.addImage(
      req.params.hotelId,
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
