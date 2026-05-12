// Lookups controller

import { Request, Response, NextFunction } from 'express';
import * as lookupsService from '../services/lookupsService';
import { AppError } from '../middlewares/errorHandler';

export async function getAllLookups(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await lookupsService.getAllLookups();
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getLookup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name } = req.params;
    if (!lookupsService.isValidLookupName(name)) {
      throw new AppError(`Unknown lookup: "${name}"`, 400);
    }
    const data = await lookupsService.getLookupByName(name);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function createLookup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name } = req.params;
    if (!lookupsService.isValidLookupName(name)) {
      throw new AppError(`Unknown lookup: "${name}"`, 400);
    }
    const entry = await lookupsService.createLookupEntry(name, req.body.name);
    res.status(201).json({ success: true, data: entry });
  } catch (err) {
    next(err);
  }
}

export async function updateLookup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name } = req.params;
    const id = parseInt(req.params.id, 10);
    if (!lookupsService.isValidLookupName(name)) {
      throw new AppError(`Unknown lookup: "${name}"`, 400);
    }
    if (isNaN(id)) throw new AppError('id must be an integer', 400);
    const entry = await lookupsService.updateLookupEntry(name, id, req.body.name);
    res.status(200).json({ success: true, data: entry });
  } catch (err) {
    next(err);
  }
}

export async function deleteLookup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name } = req.params;
    const id = parseInt(req.params.id, 10);
    if (!lookupsService.isValidLookupName(name)) {
      throw new AppError(`Unknown lookup: "${name}"`, 400);
    }
    if (isNaN(id)) throw new AppError('id must be an integer', 400);
    await lookupsService.deleteLookupEntry(name, id);
    res.status(200).json({ success: true, message: 'Entry deleted.' });
  } catch (err) {
    next(err);
  }
}
