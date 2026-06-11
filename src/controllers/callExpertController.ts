import { Request, Response, NextFunction } from 'express';
import * as callExpertService from '../services/callExpertService';
import * as emailService from '../services/emailService';

export async function createCallExpert(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { phone, name, email, scheduled_date, scheduled_slot } = req.body;
    const record = await callExpertService.createCallExpert({ phone, name, email, scheduled_date, scheduled_slot });
    emailService.sendCallExpertAdminEmail({ phone, name, email, scheduled_date, scheduled_slot }).catch(() => {});
    res.status(201).json({ success: true, message: 'Request received.', data: record });
  } catch (err) {
    next(err);
  }
}

export async function listCallExperts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await callExpertService.listCallExperts(req.query);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}
