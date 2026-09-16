// Hotel packages controller — maps HTTP requests to hotelPackagesService calls

import { Request, Response, NextFunction } from 'express';
import * as hotelPackagesService from '../services/hotelPackagesService';

export async function listPackages(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const packages = await hotelPackagesService.listPackages(req.params.hotelId);
    res.status(200).json({ success: true, data: packages });
  } catch (err) {
    next(err);
  }
}

export async function createPackage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const pkg = await hotelPackagesService.createPackage(req.params.hotelId, req.body);
    res.status(201).json({ success: true, data: pkg });
  } catch (err) {
    next(err);
  }
}

export async function updatePackage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const pkg = await hotelPackagesService.updatePackage(req.params.hotelId, req.params.packageId, req.body);
    res.status(200).json({ success: true, data: pkg });
  } catch (err) {
    next(err);
  }
}

export async function deletePackage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await hotelPackagesService.deletePackage(req.params.hotelId, req.params.packageId);
    res.status(200).json({ success: true, message: 'Package deleted.' });
  } catch (err) {
    next(err);
  }
}
