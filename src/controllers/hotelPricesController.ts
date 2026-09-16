// Hotel prices controller — maps HTTP requests to hotelPricesService calls

import { Request, Response, NextFunction } from 'express';
import * as hotelPricesService from '../services/hotelPricesService';

export async function listPrices(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const prices = await hotelPricesService.listPrices(req.params.hotelId);
    res.status(200).json({ success: true, data: prices });
  } catch (err) {
    next(err);
  }
}

export async function createPrice(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const price = await hotelPricesService.createPrice(req.params.hotelId, req.body);
    res.status(201).json({ success: true, data: price });
  } catch (err) {
    next(err);
  }
}

export async function updatePrice(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const price = await hotelPricesService.updatePrice(req.params.hotelId, req.params.priceId, req.body);
    res.status(200).json({ success: true, data: price });
  } catch (err) {
    next(err);
  }
}

export async function deletePrice(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await hotelPricesService.deletePrice(req.params.hotelId, req.params.priceId);
    res.status(200).json({ success: true, message: 'Price period deleted.' });
  } catch (err) {
    next(err);
  }
}
