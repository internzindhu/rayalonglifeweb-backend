// Hotels controller — maps HTTP requests to hotelsService calls

import { Request, Response, NextFunction } from 'express';
import * as hotelsService from '../services/hotelsService';
import type { HotelListQuery } from '../services/hotelsService';

export async function listHotels(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await hotelsService.listHotels(req.query as HotelListQuery);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function getHotel(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const hotel = await hotelsService.getHotelById(req.params.id);
    res.status(200).json({ success: true, data: hotel });
  } catch (err) {
    next(err);
  }
}

export async function getRelatedHotels(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const hotels = await hotelsService.getRelatedHotels(req.params.id);
    res.status(200).json({ success: true, data: hotels });
  } catch (err) {
    next(err);
  }
}

export async function createHotel(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const hotel = await hotelsService.createHotel(req.body);
    res.status(201).json({ success: true, data: hotel });
  } catch (err) {
    next(err);
  }
}

export async function updateHotel(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const hotel = await hotelsService.updateHotel(req.params.id, req.body);
    res.status(200).json({ success: true, data: hotel });
  } catch (err) {
    next(err);
  }
}

export async function deleteHotel(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await hotelsService.deleteHotel(req.params.id);
    res.status(200).json({ success: true, message: 'Hotel deleted.' });
  } catch (err) {
    next(err);
  }
}
