// Hotel images service — manages the hotel_images table + Supabase Storage

import prisma from '../config/database';
import { supabase } from '../config/supabase';
import { AppError } from '../middlewares/errorHandler';
import { PrismaClient } from '@prisma/client';

type TxClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

const BUCKET = 'hotel-images';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AddImageDto {
  is_primary?:  boolean;
  sort_order?:  number;
  caption?:     string;
  alt_text?:    string;
}

export interface UpdateImageDto {
  is_primary?:  boolean;
  sort_order?:  number;
  caption?:     string;
  alt_text?:    string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function storagePath(originalName: string): string {
  const ext = originalName.split('.').pop() ?? 'jpg';
  return `hotels/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
}

// ─── Service methods ──────────────────────────────────────────────────────────

/** Return all images for a hotel ordered by sort_order */
export async function listImages(hotelId: string): Promise<unknown[]> {
  await assertHotelExists(hotelId);
  return prisma.hotelImage.findMany({
    where:   { hotel_id: hotelId },
    orderBy: { sort_order: 'asc' },
  });
}

/**
 * Upload a file to Supabase Storage and register it in hotel_images.
 * If is_primary is true, the existing primary image for the hotel is demoted first.
 */
export async function addImage(
  hotelId:      string,
  buffer:       Buffer,
  originalName: string,
  mimetype:     string,
  dto:          AddImageDto,
): Promise<unknown> {
  await assertHotelExists(hotelId);

  const path = storagePath(originalName);

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: mimetype, upsert: false });

  if (uploadError) throw new AppError(`Storage upload failed: ${uploadError.message}`, 500);

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return prisma.$transaction(async (tx: TxClient) => {
    // Demote existing primary when this one is marked primary
    if (dto.is_primary) {
      await tx.hotelImage.updateMany({
        where: { hotel_id: hotelId, is_primary: true },
        data:  { is_primary: false },
      });
    }

    // Default sort_order to (max + 1) so new images go to the end
    if (dto.sort_order === undefined) {
      const last = await tx.hotelImage.findFirst({
        where:   { hotel_id: hotelId },
        orderBy: { sort_order: 'desc' },
        select:  { sort_order: true },
      });
      dto.sort_order = (last?.sort_order ?? -1) + 1;
    }

    return tx.hotelImage.create({
      data: {
        hotel_id:   hotelId,
        url:        urlData.publicUrl,
        is_primary: dto.is_primary  ?? false,
        sort_order: dto.sort_order,
        caption:    dto.caption,
        alt_text:   dto.alt_text,
      },
    });
  });
}

/**
 * Update metadata for an existing image (sort_order, is_primary, caption, alt_text).
 * Promoting to primary demotes the current primary first.
 */
export async function updateImage(
  hotelId:  string,
  imageId:  string,
  dto:      UpdateImageDto,
): Promise<unknown> {
  const image = await assertImageBelongsToHotel(hotelId, imageId);

  return prisma.$transaction(async (tx: TxClient) => {
    if (dto.is_primary && !image.is_primary) {
      await tx.hotelImage.updateMany({
        where: { hotel_id: hotelId, is_primary: true },
        data:  { is_primary: false },
      });
    }

    return tx.hotelImage.update({
      where: { id: imageId },
      data:  dto,
    });
  });
}

/**
 * Delete an image: removes from Storage then from the DB.
 * If the deleted image was the primary, the next image (by sort_order) is auto-promoted.
 */
export async function deleteImage(hotelId: string, imageId: string): Promise<void> {
  const image = await assertImageBelongsToHotel(hotelId, imageId);

  // Derive the storage path from the public URL
  const urlObj  = new URL(image.url);
  // Public URL pattern: .../storage/v1/object/public/<bucket>/<path>
  const parts   = urlObj.pathname.split(`/${BUCKET}/`);
  const path    = parts[1] ?? '';

  if (path) {
    const { error } = await supabase.storage.from(BUCKET).remove([path]);
    if (error) throw new AppError(`Storage delete failed: ${error.message}`, 500);
  }

  await prisma.$transaction(async (tx: TxClient) => {
    await tx.hotelImage.delete({ where: { id: imageId } });

    // Auto-promote the next image if we deleted the primary
    if (image.is_primary) {
      const next = await tx.hotelImage.findFirst({
        where:   { hotel_id: hotelId },
        orderBy: { sort_order: 'asc' },
      });
      if (next) {
        await tx.hotelImage.update({ where: { id: next.id }, data: { is_primary: true } });
      }
    }
  });
}

/** Reorder all images for a hotel in one call.
 *  Body: array of { id, sort_order } pairs.
 */
export async function reorderImages(
  hotelId: string,
  items:   { id: string; sort_order: number }[],
): Promise<unknown[]> {
  await assertHotelExists(hotelId);

  await prisma.$transaction(
    items.map(({ id, sort_order }) =>
      prisma.hotelImage.updateMany({
        where: { id, hotel_id: hotelId },
        data:  { sort_order },
      }),
    ),
  );

  return prisma.hotelImage.findMany({
    where:   { hotel_id: hotelId },
    orderBy: { sort_order: 'asc' },
  });
}

// ─── Guards ───────────────────────────────────────────────────────────────────

async function assertHotelExists(hotelId: string) {
  const hotel = await prisma.hotel.findUnique({ where: { id: hotelId }, select: { id: true } });
  if (!hotel) throw new AppError(`Hotel with id "${hotelId}" not found.`, 404);
  return hotel;
}

async function assertImageBelongsToHotel(hotelId: string, imageId: string) {
  const image = await prisma.hotelImage.findUnique({ where: { id: imageId } });
  if (!image || image.hotel_id !== hotelId) {
    throw new AppError(`Image "${imageId}" not found for this hotel.`, 404);
  }
  return image;
}
