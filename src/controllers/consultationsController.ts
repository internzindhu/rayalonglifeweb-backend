// Consultations controller

import { Request, Response, NextFunction } from 'express';
import * as consultationsService from '../services/consultationsService';
import * as emailService from '../services/emailService';

export async function createConsultation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const consultation = await consultationsService.createConsultation(req.body);
    emailService.sendConsultationAdminEmail(consultation).catch(() => {});
    emailService.sendConsultationUserEmail(consultation).catch(() => {});
    res.status(201).json({ success: true, message: 'Consultation request submitted.', data: consultation });
  } catch (err) {
    next(err);
  }
}

export async function listConsultations(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await consultationsService.listConsultations(req.query);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function updateConsultationStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const consultation = await consultationsService.updateConsultationStatus(req.params.id, req.body.status);
    res.status(200).json({ success: true, data: consultation });
  } catch (err) {
    next(err);
  }
}
