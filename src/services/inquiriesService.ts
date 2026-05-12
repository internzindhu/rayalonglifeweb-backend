// Inquiries service — handles hotel booking inquiries (lead capture)

import prisma from '../config/database';
import { AppError } from '../middlewares/errorHandler';
import { parsePagination, toPrismaSkipTake, buildMeta, PaginatedResult } from '../utils/pagination';

export interface CreateInquiryDto {
  hotel_id?: string;
  hotel_name: string;
  date_from?: string;
  date_to?: string;
  room_type?: string;
  people?: number;
  transport_mode?: string;
  flight_included?: string;
  extras?: string;
  total_price?: string;
  gender?: string;
  full_name: string;
  email: string;
  country?: string;
  mobile?: string;
  comment?: string;
}

export interface ListInquiriesQuery {
  status?: string;
  page?: string;
  limit?: string;
}

export async function createInquiry(dto: CreateInquiryDto) {
  if (dto.hotel_id) {
    const hotel = await prisma.hotel.findUnique({ where: { id: dto.hotel_id } });
    if (!hotel) throw new AppError(`Hotel with id "${dto.hotel_id}" not found.`, 404);
  }

  return prisma.inquiry.create({
    data: {
      hotel_id:       dto.hotel_id ?? null,
      hotel_name:     dto.hotel_name,
      date_from:      dto.date_from ? new Date(dto.date_from) : null,
      date_to:        dto.date_to ? new Date(dto.date_to) : null,
      room_type:      dto.room_type ?? null,
      people:         dto.people ?? null,
      transport_mode: dto.transport_mode ?? null,
      flight_included:dto.flight_included ?? null,
      extras:         dto.extras ?? null,
      total_price:    dto.total_price ?? null,
      gender:         dto.gender ?? null,
      full_name:      dto.full_name,
      email:          dto.email,
      country:        dto.country ?? null,
      mobile:         dto.mobile ?? null,
      comment:        dto.comment ?? null,
    },
  });
}

export async function listInquiries(
  query: ListInquiriesQuery,
): Promise<PaginatedResult<unknown>> {
  const pagination = parsePagination(query.page, query.limit);
  const { skip, take } = toPrismaSkipTake(pagination);

  const where = query.status ? { status: query.status } : {};

  const [inquiries, total] = await Promise.all([
    prisma.inquiry.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip,
      take,
    }),
    prisma.inquiry.count({ where }),
  ]);

  return { data: inquiries, meta: buildMeta(total, pagination) };
}

export async function listInquiriesByHotel(
  hotelId: string,
  query: ListInquiriesQuery,
): Promise<PaginatedResult<unknown>> {
  const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } });
  if (!hotel) throw new AppError(`Hotel with id "${hotelId}" not found.`, 404);

  const pagination = parsePagination(query.page, query.limit);
  const { skip, take } = toPrismaSkipTake(pagination);
  const where = { hotel_id: hotelId };

  const [inquiries, total] = await Promise.all([
    prisma.inquiry.findMany({ where, orderBy: { created_at: 'desc' }, skip, take }),
    prisma.inquiry.count({ where }),
  ]);

  return { data: inquiries, meta: buildMeta(total, pagination) };
}

export async function updateInquiryStatus(id: string, status: string) {
  const existing = await prisma.inquiry.findUnique({ where: { id } });
  if (!existing) throw new AppError(`Inquiry with id "${id}" not found.`, 404);
  return prisma.inquiry.update({ where: { id }, data: { status } });
}
