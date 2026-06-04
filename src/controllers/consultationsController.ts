// Consultations controller

import { Request, Response, NextFunction } from 'express';
import * as consultationsService from '../services/consultationsService';
import * as emailService from '../services/emailService';

// Map the frontend Consultation form payload (camelCase, multi-select preferred
// contact, single budget + currency) onto the service DTO. The DB stores
// preferred_contact as a comma-joined string and budget_min as
// "<CURRENCY> <amount>" so we preserve the currency without a schema change.
function mapConsultationPayload(body: any): consultationsService.CreateConsultationDto {
  const preferredContactRaw = body.preferredContact ?? body.preferred_contact;
  const preferred_contact = Array.isArray(preferredContactRaw)
    ? preferredContactRaw.filter(Boolean).join(',') || undefined
    : (typeof preferredContactRaw === 'string' && preferredContactRaw ? preferredContactRaw : undefined);

  const budgetVal = body.budget;
  const budgetCurrency = body.budgetCurrency;
  let budget_min: string | undefined = body.budget_min;
  if (budget_min === undefined && budgetVal !== undefined && budgetVal !== '' && budgetVal !== null) {
    budget_min = budgetCurrency ? `${budgetCurrency} ${budgetVal}` : String(budgetVal);
  }

  const nightsRaw = body.numberOfNights ?? body.number_of_nights;
  let number_of_nights: number | undefined;
  if (nightsRaw !== undefined && nightsRaw !== '' && nightsRaw !== null) {
    const n = typeof nightsRaw === 'number' ? nightsRaw : Number(nightsRaw);
    if (Number.isFinite(n) && n >= 1) number_of_nights = n;
  }

  const scheduleRaw = body.scheduleDateTime ?? body.schedule_datetime;
  const schedule_datetime =
    typeof scheduleRaw === 'string' && scheduleRaw ? scheduleRaw : undefined;

  return {
    gender:            body.gender || undefined,
    name:              body.name,
    country:           body.country || undefined,
    email:             body.email,
    mobile:            body.mobile || undefined,
    preferred_contact,
    travel_month:      body.travelMonth ?? body.travel_month ?? undefined,
    budget_min,
    budget_max:        body.budget_max ?? undefined,
    number_of_nights,
    schedule_datetime,
    comment:           body.comment || undefined,
  };
}

export async function createConsultation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const dto = mapConsultationPayload(req.body);
    const consultation = await consultationsService.createConsultation(dto);
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
