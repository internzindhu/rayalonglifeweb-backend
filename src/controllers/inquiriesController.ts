// Inquiries controller

import { Request, Response, NextFunction } from 'express';
import * as inquiriesService from '../services/inquiriesService';
import * as emailService from '../services/emailService';

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

  const dto: inquiriesService.CreateInquiryDto = {
    hotel_id:        body.hotelId ?? body.hotel_id,
    hotel_name:      body.hotelName ?? body.hotel_name ?? '',
    date_from:       booking.dateFrom ?? body.date_from,
    date_to:         booking.dateTo ?? body.date_to,
    room_type:       booking.roomType ?? body.room_type,
    people:          Number.isFinite(people) ? (people as number) : undefined,
    transport_mode:  booking.transportMode ?? body.transport_mode,
    flight_included: booking.flightIncluded ?? body.flight_included,
    extras:          booking.extras ?? body.extras,
    total_price:     booking.totalPrice ?? body.total_price,
    gender:          personal.gender ?? booking.gender ?? body.gender,
    full_name:       personal.fullName ?? body.full_name ?? '',
    email:           personal.email ?? body.email ?? '',
    country:         personal.country ?? body.country,
    mobile:          personal.mobile ?? body.mobile,
    comment:         personal.comment ?? body.comment,
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
