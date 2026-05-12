// Lookups service — CRUD for all reference/lookup tables

import prisma from '../config/database';
import { AppError } from '../middlewares/errorHandler';

// Allowlist of valid lookup table names (maps query param → Prisma accessor)
export const LOOKUP_NAMES = [
  'property_types',
  'facilities',
  'room_features',
  'dining_features',
  'meal_plans',
  'cuisine_types',
  'activities',
  'restrictions',
  'hotel_styles',
  'setting_types',
  'wellness_offerings',
] as const;

export type LookupName = (typeof LOOKUP_NAMES)[number];

export function isValidLookupName(name: string): name is LookupName {
  return LOOKUP_NAMES.includes(name as LookupName);
}

// Returns all lookup tables in one object for the frontend dropdown fetch
export async function getAllLookups() {
  const [
    property_types,
    facilities,
    room_features,
    dining_features,
    meal_plans,
    cuisine_types,
    activities,
    restrictions,
    hotel_styles,
    setting_types,
    wellness_offerings,
  ] = await Promise.all([
    prisma.propertyType.findMany({ orderBy: { name: 'asc' } }),
    prisma.facility.findMany({ orderBy: { name: 'asc' } }),
    prisma.roomFeature.findMany({ orderBy: { name: 'asc' } }),
    prisma.diningFeature.findMany({ orderBy: { name: 'asc' } }),
    prisma.mealPlan.findMany({ orderBy: { name: 'asc' } }),
    prisma.cuisineType.findMany({ orderBy: { name: 'asc' } }),
    prisma.activity.findMany({ orderBy: { name: 'asc' } }),
    prisma.restriction.findMany({ orderBy: { name: 'asc' } }),
    prisma.hotelStyle.findMany({ orderBy: { name: 'asc' } }),
    prisma.settingType.findMany({ orderBy: { name: 'asc' } }),
    prisma.wellnessOffering.findMany({ orderBy: { name: 'asc' } }),
  ]);

  return {
    property_types,
    facilities,
    room_features,
    dining_features,
    meal_plans,
    cuisine_types,
    activities,
    restrictions,
    hotel_styles,
    setting_types,
    wellness_offerings,
  };
}

export async function getLookupByName(name: LookupName) {
  switch (name) {
    case 'property_types':    return prisma.propertyType.findMany({ orderBy: { name: 'asc' } });
    case 'facilities':        return prisma.facility.findMany({ orderBy: { name: 'asc' } });
    case 'room_features':     return prisma.roomFeature.findMany({ orderBy: { name: 'asc' } });
    case 'dining_features':   return prisma.diningFeature.findMany({ orderBy: { name: 'asc' } });
    case 'meal_plans':        return prisma.mealPlan.findMany({ orderBy: { name: 'asc' } });
    case 'cuisine_types':     return prisma.cuisineType.findMany({ orderBy: { name: 'asc' } });
    case 'activities':        return prisma.activity.findMany({ orderBy: { name: 'asc' } });
    case 'restrictions':      return prisma.restriction.findMany({ orderBy: { name: 'asc' } });
    case 'hotel_styles':      return prisma.hotelStyle.findMany({ orderBy: { name: 'asc' } });
    case 'setting_types':     return prisma.settingType.findMany({ orderBy: { name: 'asc' } });
    case 'wellness_offerings':return prisma.wellnessOffering.findMany({ orderBy: { name: 'asc' } });
  }
}

export async function createLookupEntry(name: LookupName, entryName: string) {
  switch (name) {
    case 'property_types':    return prisma.propertyType.create({ data: { name: entryName } });
    case 'facilities':        return prisma.facility.create({ data: { name: entryName } });
    case 'room_features':     return prisma.roomFeature.create({ data: { name: entryName } });
    case 'dining_features':   return prisma.diningFeature.create({ data: { name: entryName } });
    case 'meal_plans':        return prisma.mealPlan.create({ data: { name: entryName } });
    case 'cuisine_types':     return prisma.cuisineType.create({ data: { name: entryName } });
    case 'activities':        return prisma.activity.create({ data: { name: entryName } });
    case 'restrictions':      return prisma.restriction.create({ data: { name: entryName } });
    case 'hotel_styles':      return prisma.hotelStyle.create({ data: { name: entryName } });
    case 'setting_types':     return prisma.settingType.create({ data: { name: entryName } });
    case 'wellness_offerings':return prisma.wellnessOffering.create({ data: { name: entryName } });
  }
}

export async function updateLookupEntry(name: LookupName, id: number, entryName: string) {
  try {
    switch (name) {
      case 'property_types':    return await prisma.propertyType.update({ where: { id }, data: { name: entryName } });
      case 'facilities':        return await prisma.facility.update({ where: { id }, data: { name: entryName } });
      case 'room_features':     return await prisma.roomFeature.update({ where: { id }, data: { name: entryName } });
      case 'dining_features':   return await prisma.diningFeature.update({ where: { id }, data: { name: entryName } });
      case 'meal_plans':        return await prisma.mealPlan.update({ where: { id }, data: { name: entryName } });
      case 'cuisine_types':     return await prisma.cuisineType.update({ where: { id }, data: { name: entryName } });
      case 'activities':        return await prisma.activity.update({ where: { id }, data: { name: entryName } });
      case 'restrictions':      return await prisma.restriction.update({ where: { id }, data: { name: entryName } });
      case 'hotel_styles':      return await prisma.hotelStyle.update({ where: { id }, data: { name: entryName } });
      case 'setting_types':     return await prisma.settingType.update({ where: { id }, data: { name: entryName } });
      case 'wellness_offerings':return await prisma.wellnessOffering.update({ where: { id }, data: { name: entryName } });
    }
  } catch {
    throw new AppError(`Entry with id ${id} not found in ${name}.`, 404);
  }
}

export async function deleteLookupEntry(name: LookupName, id: number) {
  try {
    switch (name) {
      case 'property_types':    return await prisma.propertyType.delete({ where: { id } });
      case 'facilities':        return await prisma.facility.delete({ where: { id } });
      case 'room_features':     return await prisma.roomFeature.delete({ where: { id } });
      case 'dining_features':   return await prisma.diningFeature.delete({ where: { id } });
      case 'meal_plans':        return await prisma.mealPlan.delete({ where: { id } });
      case 'cuisine_types':     return await prisma.cuisineType.delete({ where: { id } });
      case 'activities':        return await prisma.activity.delete({ where: { id } });
      case 'restrictions':      return await prisma.restriction.delete({ where: { id } });
      case 'hotel_styles':      return await prisma.hotelStyle.delete({ where: { id } });
      case 'setting_types':     return await prisma.settingType.delete({ where: { id } });
      case 'wellness_offerings':return await prisma.wellnessOffering.delete({ where: { id } });
    }
  } catch {
    throw new AppError(`Entry with id ${id} not found in ${name}.`, 404);
  }
}
