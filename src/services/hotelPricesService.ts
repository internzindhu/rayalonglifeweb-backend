// Hotel prices service — manages date-ranged rate periods (hotel_monthly_prices).
// A period covers [valid_from, valid_to] inclusive; overlapping periods are
// resolved by callers using `priority` (higher wins) then shortest range.

import prisma from '../config/database';
import { AppError } from '../middlewares/errorHandler';
import { Decimal } from '@prisma/client/runtime/library';

export interface CreatePriceDto {
  valid_from: string;
  valid_to:   string;
  price:      number;
  currency?:  string;
  occupancy?: string;
  priority?:  number;
}

export type UpdatePriceDto = Partial<CreatePriceDto>;

async function assertHotelExists(hotelId: string): Promise<void> {
  const hotel = await prisma.hotel.findUnique({ where: { id: hotelId }, select: { id: true } });
  if (!hotel) throw new AppError(`Hotel with id "${hotelId}" not found.`, 404);
}

async function assertPriceBelongsToHotel(hotelId: string, priceId: string) {
  const price = await prisma.hotelMonthlyPrice.findUnique({ where: { id: priceId } });
  if (!price || price.hotel_id !== hotelId) {
    throw new AppError(`Price period "${priceId}" not found for this hotel.`, 404);
  }
  return price;
}

function assertDateRange(validFrom: string, validTo: string): void {
  if (new Date(validFrom) > new Date(validTo)) {
    throw new AppError('valid_from must not be after valid_to.', 422);
  }
}

export async function listPrices(hotelId: string): Promise<unknown[]> {
  await assertHotelExists(hotelId);
  return prisma.hotelMonthlyPrice.findMany({
    where:   { hotel_id: hotelId },
    orderBy: { valid_from: 'asc' },
  });
}

export async function createPrice(hotelId: string, dto: CreatePriceDto): Promise<unknown> {
  await assertHotelExists(hotelId);
  assertDateRange(dto.valid_from, dto.valid_to);

  return prisma.hotelMonthlyPrice.create({
    data: {
      hotel_id:   hotelId,
      valid_from: new Date(dto.valid_from),
      valid_to:   new Date(dto.valid_to),
      price:      new Decimal(dto.price),
      currency:   dto.currency ?? 'USD',
      occupancy:  dto.occupancy,
      priority:   dto.priority ?? 0,
    },
  });
}

export async function updatePrice(
  hotelId: string,
  priceId: string,
  dto:     UpdatePriceDto,
): Promise<unknown> {
  const existing = await assertPriceBelongsToHotel(hotelId, priceId);

  const validFrom = dto.valid_from ?? existing.valid_from.toISOString().slice(0, 10);
  const validTo   = dto.valid_to   ?? existing.valid_to.toISOString().slice(0, 10);
  assertDateRange(validFrom, validTo);

  return prisma.hotelMonthlyPrice.update({
    where: { id: priceId },
    data: {
      ...(dto.valid_from !== undefined && { valid_from: new Date(dto.valid_from) }),
      ...(dto.valid_to   !== undefined && { valid_to:   new Date(dto.valid_to) }),
      ...(dto.price      !== undefined && { price:      new Decimal(dto.price) }),
      ...(dto.currency   !== undefined && { currency:   dto.currency }),
      ...(dto.occupancy  !== undefined && { occupancy:  dto.occupancy }),
      ...(dto.priority   !== undefined && { priority:   dto.priority }),
    },
  });
}

export async function deletePrice(hotelId: string, priceId: string): Promise<void> {
  await assertPriceBelongsToHotel(hotelId, priceId);
  await prisma.hotelMonthlyPrice.delete({ where: { id: priceId } });
}
