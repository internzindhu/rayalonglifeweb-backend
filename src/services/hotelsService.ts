// Hotels service — all DB operations for the hotels resource using the new normalised schema

import { Prisma } from '@prisma/client';
import prisma from '../config/database';
import { AppError } from '../middlewares/errorHandler';
import {
  parsePagination,
  toPrismaSkipTake,
  buildMeta,
  PaginatedResult,
} from '../utils/pagination';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HotelListQuery {
  // Scalar filters
  location?: string;
  min_nights?: string;
  max_nights?: string;
  max_occupancy?: string;
  kid_friendly?: string;
  doctors_available?: string;
  medical_report_support?: string;
  property_type?: string;
  ownership_type?: string;
  hotel_style_id?: string;
  // Multi-value junction filters (comma-separated IDs, AND semantics)
  facilities?: string;
  activities?: string;
  meal_plans?: string;
  cuisine_types?: string;
  dining_features?: string;
  room_features?: string;
  restrictions?: string;
  wellness_offerings?: string;
  setting_types?: string;
  property_types?: string;
  // Pagination & sort
  page?: string;
  limit?: string;
  sort_by?: string;
  sort_order?: string;
}

export interface CreateHotelDto {
  name: string;
  website?: string;
  location?: string;
  address?: string;
  chain_name?: string;
  marketing_material?: Prisma.InputJsonValue;
  property_type?: string;
  min_nights?: number;
  rooms_count?: number;
  max_occupancy?: number;
  doctors_count?: number;
  medical_report_support?: boolean;
  kid_friendly?: boolean;
  min_age?: number;
  ownership_type?: string;
  star_classification?: string;
  no_min_nights?: boolean;
  doctors_available?: boolean;
  consultation_time?: string;
  pricing_notes?: string;
  commission_rate?: string;
  rates_currency?: string;
  contact_name?: string;
  contact_number?: string;
  contact_email?: string;
  transfers_info?: string;
  sustainability_csr?: string;
  remarks?: string;
  data_fed_by?: string;
  hotel_style_id?: number;
  description?: string;
  images?: string[];
  price?: string;
  slogan_line?: string;
  rating?: number;
  reviews_count?: number;
  is_active?: boolean;
  // Junction IDs
  facility_ids?: number[];
  activity_ids?: number[];
  meal_plan_ids?: number[];
  cuisine_type_ids?: number[];
  dining_feature_ids?: number[];
  room_feature_ids?: number[];
  restriction_ids?: number[];
  wellness_offering_ids?: number[];
  setting_type_ids?: number[];
  property_type_ids?: number[];
}

export type UpdateHotelDto = Partial<CreateHotelDto>;

// ─── Include shape — used for both list and detail responses ─────────────────

export const hotelFullInclude = {
  hotel_style:       true,
  property_types:    { include: { property_type: true } },
  facilities:        { include: { facility: true } },
  room_features:     { include: { room_feature: true } },
  dining_features:   { include: { dining_feature: true } },
  meal_plans:        { include: { meal_plan: true } },
  cuisine_types:     { include: { cuisine_type: true } },
  activities:        { include: { activity: true } },
  restrictions:      { include: { restriction: true } },
  setting_types:     { include: { setting_type: true } },
  wellness_offerings:{ include: { wellness_offering: true } },
} satisfies Prisma.HotelInclude;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseIds(raw: string | undefined): number[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n));
}

function buildWhereClause(query: HotelListQuery): Prisma.HotelWhereInput {
  const andConditions: Prisma.HotelWhereInput[] = [{ is_active: true }];

  if (query.location) {
    andConditions.push({ location: { contains: query.location, mode: 'insensitive' } });
  }
  if (query.property_type) {
    andConditions.push({ property_type: query.property_type });
  }
  if (query.ownership_type) {
    andConditions.push({ ownership_type: query.ownership_type });
  }
  if (query.hotel_style_id) {
    const id = parseInt(query.hotel_style_id, 10);
    if (!isNaN(id)) andConditions.push({ hotel_style_id: id });
  }
  if (query.kid_friendly !== undefined) {
    andConditions.push({ kid_friendly: query.kid_friendly === 'true' });
  }
  if (query.doctors_available !== undefined) {
    andConditions.push({ doctors_available: query.doctors_available === 'true' });
  }
  if (query.medical_report_support !== undefined) {
    andConditions.push({ medical_report_support: query.medical_report_support === 'true' });
  }
  if (query.min_nights) {
    const val = parseInt(query.min_nights, 10);
    if (!isNaN(val)) andConditions.push({ min_nights: { lte: val } });
  }
  if (query.max_nights) {
    const val = parseInt(query.max_nights, 10);
    if (!isNaN(val)) andConditions.push({ min_nights: { gte: val } });
  }
  if (query.max_occupancy) {
    const val = parseInt(query.max_occupancy, 10);
    if (!isNaN(val)) andConditions.push({ max_occupancy: { gte: val } });
  }

  // Multi-value AND filters: one `some` clause per requested ID
  const junctionFilters: Array<[keyof Prisma.HotelWhereInput, string | undefined, string]> = [
    ['facilities',         query.facilities,         'facility_id'],
    ['activities',         query.activities,         'activity_id'],
    ['meal_plans',         query.meal_plans,         'meal_plan_id'],
    ['cuisine_types',      query.cuisine_types,      'cuisine_type_id'],
    ['dining_features',    query.dining_features,    'dining_feature_id'],
    ['room_features',      query.room_features,      'room_feature_id'],
    ['restrictions',       query.restrictions,       'restriction_id'],
    ['wellness_offerings', query.wellness_offerings, 'wellness_offering_id'],
    ['setting_types',      query.setting_types,      'setting_type_id'],
    ['property_types',     query.property_types,     'property_type_id'],
  ];

  for (const [relation, rawValue, idField] of junctionFilters) {
    const ids = parseIds(rawValue);
    for (const id of ids) {
      andConditions.push({ [relation]: { some: { [idField]: id } } } as Prisma.HotelWhereInput);
    }
  }

  return { AND: andConditions };
}

// ─── Service methods ──────────────────────────────────────────────────────────

const ALLOWED_SORT = ['name', 'created_at', 'rating', 'price'] as const;
type SortField = (typeof ALLOWED_SORT)[number];

export async function listHotels(
  query: HotelListQuery,
): Promise<PaginatedResult<unknown>> {
  const pagination = parsePagination(query.page, query.limit);
  const { skip, take } = toPrismaSkipTake(pagination);

  const sortBy: SortField = ALLOWED_SORT.includes(query.sort_by as SortField)
    ? (query.sort_by as SortField)
    : 'created_at';
  const sortOrder: Prisma.SortOrder = query.sort_order === 'asc' ? 'asc' : 'desc';

  const where = buildWhereClause(query);

  const [hotels, total] = await Promise.all([
    prisma.hotel.findMany({
      where,
      include: hotelFullInclude,
      orderBy: { [sortBy]: sortOrder },
      skip,
      take,
    }),
    prisma.hotel.count({ where }),
  ]);

  return { data: hotels, meta: buildMeta(total, pagination) };
}

export async function getHotelById(id: string): Promise<unknown> {
  const hotel = await prisma.hotel.findUnique({
    where: { id },
    include: hotelFullInclude,
  });

  if (!hotel) throw new AppError(`Hotel with id "${id}" not found.`, 404);
  return hotel;
}

export async function getRelatedHotels(id: string): Promise<unknown[]> {
  const hotel = await prisma.hotel.findUnique({ where: { id }, select: { location: true } });
  if (!hotel) throw new AppError(`Hotel with id "${id}" not found.`, 404);

  const baseWhere: Prisma.HotelWhereInput = { is_active: true, id: { not: id } };

  if (hotel.location) {
    const same = await prisma.hotel.findMany({
      where: { ...baseWhere, location: hotel.location },
      include: hotelFullInclude,
      take: 4,
    });
    if (same.length > 0) return same;
  }

  // Fallback: any 4 active hotels ordered by newest
  return prisma.hotel.findMany({
    where: baseWhere,
    include: hotelFullInclude,
    orderBy: { created_at: 'desc' },
    take: 4,
  });
}

export async function createHotel(dto: CreateHotelDto): Promise<unknown> {
  const {
    facility_ids = [],
    activity_ids = [],
    meal_plan_ids = [],
    cuisine_type_ids = [],
    dining_feature_ids = [],
    room_feature_ids = [],
    restriction_ids = [],
    wellness_offering_ids = [],
    setting_type_ids = [],
    property_type_ids = [],
    rating,
    ...hotelData
  } = dto;

  return prisma.$transaction(async (tx) => {
    const hotel = await tx.hotel.create({
      data: {
        ...hotelData,
        rating: rating !== undefined ? new Prisma.Decimal(rating) : undefined,
        facilities:          { create: facility_ids.map((id) => ({ facility_id: id })) },
        activities:          { create: activity_ids.map((id) => ({ activity_id: id })) },
        meal_plans:          { create: meal_plan_ids.map((id) => ({ meal_plan_id: id })) },
        cuisine_types:       { create: cuisine_type_ids.map((id) => ({ cuisine_type_id: id })) },
        dining_features:     { create: dining_feature_ids.map((id) => ({ dining_feature_id: id })) },
        room_features:       { create: room_feature_ids.map((id) => ({ room_feature_id: id })) },
        restrictions:        { create: restriction_ids.map((id) => ({ restriction_id: id })) },
        wellness_offerings:  { create: wellness_offering_ids.map((id) => ({ wellness_offering_id: id })) },
        setting_types:       { create: setting_type_ids.map((id) => ({ setting_type_id: id })) },
        property_types:      { create: property_type_ids.map((id) => ({ property_type_id: id })) },
      },
      include: hotelFullInclude,
    });
    return hotel;
  });
}

export async function updateHotel(id: string, dto: UpdateHotelDto): Promise<unknown> {
  const existing = await prisma.hotel.findUnique({ where: { id } });
  if (!existing) throw new AppError(`Hotel with id "${id}" not found.`, 404);

  const {
    facility_ids,
    activity_ids,
    meal_plan_ids,
    cuisine_type_ids,
    dining_feature_ids,
    room_feature_ids,
    restriction_ids,
    wellness_offering_ids,
    setting_type_ids,
    property_type_ids,
    rating,
    ...hotelData
  } = dto;

  return prisma.$transaction(async (tx) => {
    // Replace junction rows only when the array was explicitly provided
    if (facility_ids !== undefined) {
      await tx.hotelFacility.deleteMany({ where: { hotel_id: id } });
      await tx.hotelFacility.createMany({ data: facility_ids.map((fid) => ({ hotel_id: id, facility_id: fid })) });
    }
    if (activity_ids !== undefined) {
      await tx.hotelActivity.deleteMany({ where: { hotel_id: id } });
      await tx.hotelActivity.createMany({ data: activity_ids.map((aid) => ({ hotel_id: id, activity_id: aid })) });
    }
    if (meal_plan_ids !== undefined) {
      await tx.hotelMealPlan.deleteMany({ where: { hotel_id: id } });
      await tx.hotelMealPlan.createMany({ data: meal_plan_ids.map((mid) => ({ hotel_id: id, meal_plan_id: mid })) });
    }
    if (cuisine_type_ids !== undefined) {
      await tx.hotelCuisineType.deleteMany({ where: { hotel_id: id } });
      await tx.hotelCuisineType.createMany({ data: cuisine_type_ids.map((cid) => ({ hotel_id: id, cuisine_type_id: cid })) });
    }
    if (dining_feature_ids !== undefined) {
      await tx.hotelDiningFeature.deleteMany({ where: { hotel_id: id } });
      await tx.hotelDiningFeature.createMany({ data: dining_feature_ids.map((did) => ({ hotel_id: id, dining_feature_id: did })) });
    }
    if (room_feature_ids !== undefined) {
      await tx.hotelRoomFeature.deleteMany({ where: { hotel_id: id } });
      await tx.hotelRoomFeature.createMany({ data: room_feature_ids.map((rid) => ({ hotel_id: id, room_feature_id: rid })) });
    }
    if (restriction_ids !== undefined) {
      await tx.hotelRestriction.deleteMany({ where: { hotel_id: id } });
      await tx.hotelRestriction.createMany({ data: restriction_ids.map((rid) => ({ hotel_id: id, restriction_id: rid })) });
    }
    if (wellness_offering_ids !== undefined) {
      await tx.hotelWellnessOffering.deleteMany({ where: { hotel_id: id } });
      await tx.hotelWellnessOffering.createMany({ data: wellness_offering_ids.map((wid) => ({ hotel_id: id, wellness_offering_id: wid })) });
    }
    if (setting_type_ids !== undefined) {
      await tx.hotelSettingType.deleteMany({ where: { hotel_id: id } });
      await tx.hotelSettingType.createMany({ data: setting_type_ids.map((sid) => ({ hotel_id: id, setting_type_id: sid })) });
    }
    if (property_type_ids !== undefined) {
      await tx.hotelPropertyType.deleteMany({ where: { hotel_id: id } });
      await tx.hotelPropertyType.createMany({ data: property_type_ids.map((pid) => ({ hotel_id: id, property_type_id: pid })) });
    }

    return tx.hotel.update({
      where: { id },
      data: {
        ...hotelData,
        rating: rating !== undefined ? new Prisma.Decimal(rating) : undefined,
      },
      include: hotelFullInclude,
    });
  });
}

export async function deleteHotel(id: string): Promise<void> {
  const existing = await prisma.hotel.findUnique({ where: { id } });
  if (!existing) throw new AppError(`Hotel with id "${id}" not found.`, 404);
  await prisma.hotel.delete({ where: { id } });
}
