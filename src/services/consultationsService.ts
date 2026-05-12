// Consultations service — handles wellness consultation scheduling requests

import prisma from '../config/database';
import { AppError } from '../middlewares/errorHandler';
import { parsePagination, toPrismaSkipTake, buildMeta, PaginatedResult } from '../utils/pagination';

export interface CreateConsultationDto {
  gender?: string;
  name: string;
  country?: string;
  email: string;
  mobile?: string;
  preferred_contact?: string;
  travel_month?: string;
  budget_min?: string;
  budget_max?: string;
  number_of_nights?: number;
  schedule_datetime?: string;
  comment?: string;
}

export interface ListConsultationsQuery {
  status?: string;
  page?: string;
  limit?: string;
}

export async function createConsultation(dto: CreateConsultationDto) {
  return prisma.consultation.create({
    data: {
      gender:            dto.gender ?? null,
      name:              dto.name,
      country:           dto.country ?? null,
      email:             dto.email,
      mobile:            dto.mobile ?? null,
      preferred_contact: dto.preferred_contact ?? null,
      travel_month:      dto.travel_month ?? null,
      budget_min:        dto.budget_min ?? null,
      budget_max:        dto.budget_max ?? null,
      number_of_nights:  dto.number_of_nights ?? null,
      schedule_datetime: dto.schedule_datetime ? new Date(dto.schedule_datetime) : null,
      comment:           dto.comment ?? null,
    },
  });
}

export async function listConsultations(
  query: ListConsultationsQuery,
): Promise<PaginatedResult<unknown>> {
  const pagination = parsePagination(query.page, query.limit);
  const { skip, take } = toPrismaSkipTake(pagination);
  const where = query.status ? { status: query.status } : {};

  const [consultations, total] = await Promise.all([
    prisma.consultation.findMany({ where, orderBy: { created_at: 'desc' }, skip, take }),
    prisma.consultation.count({ where }),
  ]);

  return { data: consultations, meta: buildMeta(total, pagination) };
}

export async function updateConsultationStatus(id: string, status: string) {
  const existing = await prisma.consultation.findUnique({ where: { id } });
  if (!existing) throw new AppError(`Consultation with id "${id}" not found.`, 404);
  return prisma.consultation.update({ where: { id }, data: { status } });
}
