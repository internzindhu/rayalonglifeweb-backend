/**
 * Seed script — idempotent upsert of all lookup table values.
 * Run with: npx ts-node prisma/seed.ts
 *
 * The DB already has all lookup values seeded from the Property Information Sheet.
 * This script only inserts entries that are missing (safe to re-run at any time).
 * No hotel data is seeded here — hotels are imported from the spreadsheet.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({ log: ['warn', 'error'] });

// ─── Lookup reference data ─────────────────────────────────────────────────

const FACILITIES = [
  'Swimming Pool', 'Spa', 'Gym / Fitness Centre', 'Free Wi-Fi', 'Airport Shuttle',
  'Business Centre', 'Concierge', 'Beach Access', 'Tennis Court', 'Kids Club',
  'Sauna', 'Steam Room', 'Yoga Studio', 'Meditation Hall', 'Ayurveda Centre',
];

const ROOM_FEATURES = [
  'Ocean View', 'Balcony', 'Kitchenette', 'Butler Service', 'Jacuzzi',
  'Garden View', 'Mountain View', 'Private Pool', 'Air Conditioning',
];

const DINING_FEATURES = [
  'Fine Dining Restaurant', 'Buffet', 'Rooftop Bar', 'Private Dining',
  'In-Room Dining', 'Ayurvedic Cuisine', 'Vegan / Vegetarian Options', 'Juice Bar',
];

const MEAL_PLANS = [
  'Room Only', 'Bed & Breakfast', 'Half Board', 'Full Board', 'All Inclusive',
  'Ayurvedic Meal Plan',
];

const CUISINE_TYPES = [
  'International', 'Mediterranean', 'Asian Fusion', 'Middle Eastern', 'Italian',
  'Sri Lankan', 'Indian', 'Continental',
];

const ACTIVITIES = [
  'Snorkelling', 'Scuba Diving', 'Yoga Classes', 'Cooking Classes', 'Hiking Trails',
  'Water Sports', 'Desert Safari', 'Wine Tasting', 'Golf', 'Cultural Tours',
  'Meditation', 'Ayurvedic Treatments', 'Cycling', 'Bird Watching',
];

const RESTRICTIONS = [
  'No Pets', 'No Smoking', 'Adults Only (18+)', 'Adults Only (16+)',
  'Dry Property (No Alcohol)',
];

const HOTEL_STYLES = [
  'Luxury', 'Boutique', 'Budget', 'Heritage', 'Eco / Sustainable',
  'Modern', 'Traditional', 'Minimalist',
];

const SETTING_TYPES = [
  'Beach', 'Mountain', 'City', 'Countryside', 'Jungle / Forest',
  'Desert', 'Lakeside', 'Island',
];

const WELLNESS_OFFERINGS = [
  'Ayurveda', 'Yoga & Meditation', 'Detox / Fasting', 'Thalassotherapy',
  'Traditional Chinese Medicine', 'Naturopathy', 'Physiotherapy',
  'Weight Management', 'Stress Management', 'Mental Wellness',
];

const PROPERTY_TYPES = [
  'Ayurveda Only', 'Wellness', 'Leisure',
];

// ─── Seed helper ───────────────────────────────────────────────────────────

async function upsertByName(
  label: string,
  names: string[],
  upsertFn: (name: string) => Promise<unknown>,
): Promise<void> {
  let inserted = 0;
  await Promise.all(
    names.map(async (name) => {
      await upsertFn(name);
      inserted++;
    }),
  );
  console.log(`  ✔ ${label}: ${inserted} entries ensured`);
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log('🌱 Starting seed...');

  await upsertByName('property_types', PROPERTY_TYPES, (name) =>
    prisma.propertyType.upsert({ where: { name }, update: {}, create: { name } }),
  );
  await upsertByName('facilities', FACILITIES, (name) =>
    prisma.facility.upsert({ where: { name }, update: {}, create: { name } }),
  );
  await upsertByName('room_features', ROOM_FEATURES, (name) =>
    prisma.roomFeature.upsert({ where: { name }, update: {}, create: { name } }),
  );
  await upsertByName('dining_features', DINING_FEATURES, (name) =>
    prisma.diningFeature.upsert({ where: { name }, update: {}, create: { name } }),
  );
  await upsertByName('meal_plans', MEAL_PLANS, (name) =>
    prisma.mealPlan.upsert({ where: { name }, update: {}, create: { name } }),
  );
  await upsertByName('cuisine_types', CUISINE_TYPES, (name) =>
    prisma.cuisineType.upsert({ where: { name }, update: {}, create: { name } }),
  );
  await upsertByName('activities', ACTIVITIES, (name) =>
    prisma.activity.upsert({ where: { name }, update: {}, create: { name } }),
  );
  await upsertByName('restrictions', RESTRICTIONS, (name) =>
    prisma.restriction.upsert({ where: { name }, update: {}, create: { name } }),
  );
  await upsertByName('hotel_styles', HOTEL_STYLES, (name) =>
    prisma.hotelStyle.upsert({ where: { name }, update: {}, create: { name } }),
  );
  await upsertByName('setting_types', SETTING_TYPES, (name) =>
    prisma.settingType.upsert({ where: { name }, update: {}, create: { name } }),
  );
  await upsertByName('wellness_offerings', WELLNESS_OFFERINGS, (name) =>
    prisma.wellnessOffering.upsert({ where: { name }, update: {}, create: { name } }),
  );

  console.log('\n🎉 Seed completed — all lookup values ensured.');
}

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
