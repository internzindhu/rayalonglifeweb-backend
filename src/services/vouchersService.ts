// Vouchers service — handles gift voucher purchase requests

import prisma from '../config/database';
import { AppError } from '../middlewares/errorHandler';
import { parsePagination, toPrismaSkipTake, buildMeta, PaginatedResult } from '../utils/pagination';

export interface CreateVoucherDto {
  quantity: number;
  voucher_value?: number;
  custom_value?: number;
  sender_full_name: string;
  sender_email: string;
  sender_contact?: string;
  receiver_first_name: string;
  receiver_last_name?: string;
  receiver_email?: string;
  receiver_contact?: string;
  receive_method?: string;
  invoice_to_company?: boolean;
  notes?: string;
}

export interface ListVouchersQuery {
  status?: string;
  page?: string;
  limit?: string;
}

export async function createVoucher(dto: CreateVoucherDto) {
  return prisma.voucher.create({
    data: {
      quantity:            dto.quantity,
      voucher_value:       dto.voucher_value ?? null,
      custom_value:        dto.custom_value ?? null,
      sender_full_name:    dto.sender_full_name,
      sender_email:        dto.sender_email,
      sender_contact:      dto.sender_contact ?? null,
      receiver_first_name: dto.receiver_first_name,
      receiver_last_name:  dto.receiver_last_name ?? null,
      receiver_email:      dto.receiver_email ?? null,
      receiver_contact:    dto.receiver_contact ?? null,
      receive_method:      dto.receive_method ?? null,
      invoice_to_company:  dto.invoice_to_company ?? false,
      notes:               dto.notes ?? null,
    },
  });
}

export async function listVouchers(
  query: ListVouchersQuery,
): Promise<PaginatedResult<unknown>> {
  const pagination = parsePagination(query.page, query.limit);
  const { skip, take } = toPrismaSkipTake(pagination);
  const where = query.status ? { status: query.status } : {};

  const [vouchers, total] = await Promise.all([
    prisma.voucher.findMany({ where, orderBy: { created_at: 'desc' }, skip, take }),
    prisma.voucher.count({ where }),
  ]);

  return { data: vouchers, meta: buildMeta(total, pagination) };
}

export async function updateVoucherStatus(id: string, status: string) {
  const existing = await prisma.voucher.findUnique({ where: { id } });
  if (!existing) throw new AppError(`Voucher with id "${id}" not found.`, 404);
  return prisma.voucher.update({ where: { id }, data: { status } });
}
