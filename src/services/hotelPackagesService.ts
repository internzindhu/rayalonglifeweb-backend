// Hotel packages service — manages hotel_packages (the "Packages" accordion
// on the public hotel detail page).

import prisma from '../config/database';
import { AppError } from '../middlewares/errorHandler';
import { Prisma } from '@prisma/client';

export interface CreatePackageDto {
  name:        string;
  items?:      string[];
  group_label?: string;
  sort_order?: number;
}

export type UpdatePackageDto = Partial<CreatePackageDto>;

async function assertHotelExists(hotelId: string): Promise<void> {
  const hotel = await prisma.hotel.findUnique({ where: { id: hotelId }, select: { id: true } });
  if (!hotel) throw new AppError(`Hotel with id "${hotelId}" not found.`, 404);
}

async function assertPackageBelongsToHotel(hotelId: string, packageId: string) {
  const pkg = await prisma.hotelPackage.findUnique({ where: { id: packageId } });
  if (!pkg || pkg.hotel_id !== hotelId) {
    throw new AppError(`Package "${packageId}" not found for this hotel.`, 404);
  }
  return pkg;
}

export async function listPackages(hotelId: string): Promise<unknown[]> {
  await assertHotelExists(hotelId);
  return prisma.hotelPackage.findMany({
    where:   { hotel_id: hotelId },
    orderBy: { sort_order: 'asc' },
  });
}

export async function createPackage(hotelId: string, dto: CreatePackageDto): Promise<unknown> {
  await assertHotelExists(hotelId);

  let sortOrder = dto.sort_order;
  if (sortOrder === undefined) {
    const last = await prisma.hotelPackage.findFirst({
      where:   { hotel_id: hotelId },
      orderBy: { sort_order: 'desc' },
      select:  { sort_order: true },
    });
    sortOrder = (last?.sort_order ?? -1) + 1;
  }

  return prisma.hotelPackage.create({
    data: {
      hotel_id:    hotelId,
      name:        dto.name,
      items:       (dto.items ?? []) as Prisma.InputJsonValue,
      group_label: dto.group_label,
      sort_order:  sortOrder,
    },
  });
}

export async function updatePackage(
  hotelId:   string,
  packageId: string,
  dto:       UpdatePackageDto,
): Promise<unknown> {
  await assertPackageBelongsToHotel(hotelId, packageId);

  return prisma.hotelPackage.update({
    where: { id: packageId },
    data: {
      ...(dto.name        !== undefined && { name: dto.name }),
      ...(dto.items       !== undefined && { items: dto.items as Prisma.InputJsonValue }),
      ...(dto.group_label !== undefined && { group_label: dto.group_label }),
      ...(dto.sort_order  !== undefined && { sort_order: dto.sort_order }),
    },
  });
}

export async function deletePackage(hotelId: string, packageId: string): Promise<void> {
  await assertPackageBelongsToHotel(hotelId, packageId);
  await prisma.hotelPackage.delete({ where: { id: packageId } });
}
