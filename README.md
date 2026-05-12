# RAYA Backend

Node.js + Express + TypeScript + Prisma backend for the RAYA wellness hotel platform.

**Supabase project**: `mkvydwpkzflndxvaopbn` (ap-southeast-1)

---

## Environment Variables

Copy `.env.example` to `.env` and fill in all values.

| Variable | Description |
|---|---|
| `DATABASE_URL` | Pooled Postgres connection string (Supabase pgbouncer) |
| `DIRECT_URL` | Direct (non-pooled) connection for Prisma migrations |
| `SUPABASE_URL` | `https://mkvydwpkzflndxvaopbn.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key — server only, never expose |
| `SUPABASE_JWT_SECRET` | JWT secret for verifying user tokens (Supabase → Settings → API) |
| `RESEND_API_KEY` | API key for the Resend email service |
| `EMAIL_FROM` | From address, e.g. `RAYA <noreply@rayalonglife.com>` |
| `ADMIN_EMAIL` | Address to receive admin notification emails |
| `PORT` | HTTP port, default `3000` |
| `NODE_ENV` | `development` or `production` |

---

## Getting Started

```bash
npm install
npx prisma generate
npm run dev
```

---

## Auth Model

Authentication uses **Supabase JWT**. All admin endpoints require:

```
Authorization: Bearer <supabase_access_token>
```

The middleware (`src/middlewares/requireAdmin.ts`) verifies the token using `SUPABASE_JWT_SECRET` (HS256) and checks that `app_metadata.role === 'admin'`.

### Creating the first admin user

After the user signs up via Supabase Auth, run this SQL in the Supabase SQL Editor:

```sql
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'::jsonb
WHERE email = 'your-admin@example.com';
```

Or via the Supabase Admin API:
```ts
await supabase.auth.admin.updateUserById(userId, {
  app_metadata: { role: 'admin' },
});
```

---

## API Endpoints

### Hotels (public)

| Method | Path | Description |
|---|---|---|
| GET | `/api/hotels` | List active hotels with filters, pagination, sort |
| GET | `/api/hotels/:id` | Single hotel with all relations |
| GET | `/api/hotels/:id/related` | Up to 4 hotels in the same location |

**GET /api/hotels query parameters:**

Scalar: `location`, `min_nights`, `max_nights`, `max_occupancy`, `kid_friendly`, `doctors_available`, `medical_report_support`, `property_type`, `ownership_type`, `hotel_style_id`

Multi (comma-separated IDs, AND logic): `facilities`, `activities`, `meal_plans`, `cuisine_types`, `dining_features`, `room_features`, `restrictions`, `wellness_offerings`, `setting_types`, `property_types`

Pagination: `page`, `limit` (default 20, max 100)

Sort: `sort_by` ∈ {name, created_at, rating, price}, `sort_order` ∈ {asc, desc}

### Hotels (admin)

| Method | Path | Description |
|---|---|---|
| POST | `/api/hotels` | Create hotel (body includes `*_ids` arrays) |
| PUT | `/api/hotels/:id` | Full update; providing `*_ids` replaces those junctions |
| DELETE | `/api/hotels/:id` | Hard delete (cascades junctions) |
| GET | `/api/hotels/:hotelId/inquiries` | Inquiries for a specific hotel |

### Lead Capture (public POST, admin GET/PATCH)

| Method | Path | Description |
|---|---|---|
| POST | `/api/inquiries` | Submit a hotel booking inquiry |
| GET | `/api/inquiries` | List all inquiries (admin) |
| PATCH | `/api/inquiries/:id/status` | Update status (admin) |
| POST | `/api/consultations` | Submit a consultation request |
| GET | `/api/consultations` | List consultations (admin) |
| PATCH | `/api/consultations/:id/status` | Update status (admin) |
| POST | `/api/contacts` | Submit a contact form |
| GET | `/api/contacts` | List contacts (admin) |
| POST | `/api/vouchers` | Submit a voucher order |
| GET | `/api/vouchers` | List vouchers (admin) |
| PATCH | `/api/vouchers/:id/status` | Update status (admin) |
| POST | `/api/questionnaire` | Submit questionnaire answers |
| GET | `/api/questionnaire` | List submissions (admin) |

All public POST endpoints are rate-limited to **5 requests per IP per 10 minutes**.

### Lookups

| Method | Path | Description |
|---|---|---|
| GET | `/api/lookups` | All lookup tables in one response |
| GET | `/api/lookups/:name` | Single lookup table |
| POST | `/api/lookups/:name` | Add entry (admin) |
| PUT | `/api/lookups/:name/:id` | Update entry (admin) |
| DELETE | `/api/lookups/:name/:id` | Delete entry (admin) |

Valid `:name` values: `property_types`, `facilities`, `room_features`, `dining_features`, `meal_plans`, `cuisine_types`, `activities`, `restrictions`, `hotel_styles`, `setting_types`, `wellness_offerings`

### Image Uploads

| Method | Path | Description |
|---|---|---|
| POST | `/api/uploads/hotel-image` | Upload an image (admin, multipart `file` field) |
| DELETE | `/api/uploads/hotel-image` | Delete an image (admin, body `{ path }`) |

**Upload workflow:**
1. `POST /api/uploads/hotel-image` with `multipart/form-data`, field `file` (max 10 MB, jpeg/png/webp/gif)
2. Response: `{ url, path }` — use `url` in the hotel's `images[]` array
3. `POST /api/hotels` or `PUT /api/hotels/:id` with `images: [url, ...]`

---

## Database

The schema is managed in Supabase. To regenerate the Prisma client after DB changes:

```bash
npx prisma db pull   # sync schema from DB
npx prisma generate  # regenerate client
```

Do **not** run `prisma migrate` — migrations are managed directly in Supabase.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript |
| `npm start` | Run compiled output |
| `npm run seed` | Run idempotent lookup seed |
| `npm run prisma:generate` | Regenerate Prisma client |
| `npm run prisma:studio` | Open Prisma Studio |
