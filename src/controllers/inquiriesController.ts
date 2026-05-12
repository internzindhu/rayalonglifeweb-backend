// Inquiries controller

import { Request, Response, NextFunction } from 'express';
import * as inquiriesService from '../services/inquiriesService';
import * as emailService from '../services/emailService';

export async function createInquiry(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const inquiry = await inquiriesService.createInquiry(req.body);
    // Fire-and-forget email notifications
    emailService.sendInquiryAdminEmail(inquiry).catch(() => {});
    emailService.sendInquiryUserEmail(inquiry).catch(() => {});
    res.status(201).json({ success: true, message: 'Inquiry submitted successfully.', data: inquiry });
  } catch (err) {
    next(err);
  }
}

export async function listInquiries(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await inquiriesService.listInquiries(req.query);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function listInquiriesByHotel(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await inquiriesService.listInquiriesByHotel(req.params.hotelId, req.query);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function updateInquiryStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const inquiry = await inquiriesService.updateInquiryStatus(req.params.id, req.body.status);
    res.status(200).json({ success: true, data: inquiry });
  } catch (err) {
    next(err);
  }
}
