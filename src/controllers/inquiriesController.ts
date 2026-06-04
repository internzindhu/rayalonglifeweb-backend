// Inquiries controller

import { Request, Response, NextFunction } from 'express';
import * as inquiriesService from '../services/inquiriesService';
import * as emailService from '../services/emailService';

// Treat empty strings the same as undefined so they don't reach the DB and
// violate CHECK constraints (e.g. inquiries_flight_included_check, room_type).
function cleanStr(v: unknown): string | undefined {
  if (v === undefined || v === null) return undefined;
  const s = String(v).trim();
  return s === '' ? undefined : s;
}

// Map either the nested frontend payload ({ booking, personal, hotelName })
// or the flat snake_case shape to the service DTO.
function mapInquiryPayload(body: any): inquiriesService.CreateInquiryDto {
  const booking = body.booking ?? {};
  const personal = body.personal ?? {};

  const peopleRaw = booking.people ?? body.people;
  const people =
    peopleRaw === undefined || peopleRaw === null || peopleRaw === ''
      ? undefined
      : typeof peopleRaw === 'number' ? peopleRaw : Number(peopleRaw);

  // Normalize enum-constrained values: only let through valid values for the
  // DB CHECK constraints. Anything else (including '') becomes undefined.
  const rawFlight = cleanStr(booking.flightIncluded ?? body.flight_included);
  const flight_included =
    rawFlight === 'Included' || rawFlight === 'Not included' ? rawFlight : undefined;

  const rawRoom = cleanStr(booking.roomType ?? body.room_type);
  const room_type =
    rawRoom === 'Single' || rawRoom === 'Double' ? rawRoom : undefined;

  const dto: inquiriesService.CreateInquiryDto = {
    hotel_id:        cleanStr(body.hotelId ?? body.hotel_id),
    hotel_name:      cleanStr(body.hotelName ?? body.hotel_name) ?? '',
    date_from:       cleanStr(booking.dateFrom ?? body.date_from),
    date_to:         cleanStr(booking.dateTo ?? body.date_to),
    room_type,
    people:          Number.isFinite(people) ? (people as number) : undefined,
    transport_mode:  cleanStr(booking.transportMode ?? body.transport_mode),
    flight_included,
    extras:          cleanStr(booking.extras ?? body.extras),
    total_price:     cleanStr(booking.totalPrice ?? body.total_price),
    gender:          cleanStr(personal.gender ?? booking.gender ?? body.gender),
    full_name:       cleanStr(personal.fullName ?? body.full_name) ?? '',
    email:           cleanStr(personal.email ?? body.email) ?? '',
    country:         cleanStr(personal.country ?? body.country),
    mobile:          cleanStr(personal.mobile ?? body.mobile),
    comment:         cleanStr(personal.comment ?? body.comment),
  };
  return dto;
}

export async function createInquiry(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const dto = mapInquiryPayload(req.body);
    if (!dto.hotel_name || !dto.full_name || !dto.email) {
      res.status(400).json({ success: false, message: 'hotel_name, full_name and email are required.' });
      return;
    }
    const inquiry = await inquiriesService.createInquiry(dto);
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
