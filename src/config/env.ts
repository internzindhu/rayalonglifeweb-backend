// Typed environment loader — validates required vars at startup and throws if any are missing

function requireVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  DATABASE_URL:              requireVar('DATABASE_URL'),
  DIRECT_URL:                requireVar('DIRECT_URL'),
  SUPABASE_URL:              requireVar('SUPABASE_URL'),
  SUPABASE_SERVICE_ROLE_KEY: requireVar('SUPABASE_SERVICE_ROLE_KEY'),
  SUPABASE_JWT_SECRET:       requireVar('SUPABASE_JWT_SECRET'),
  RESEND_API_KEY:            requireVar('RESEND_API_KEY'),
  EMAIL_FROM:                requireVar('EMAIL_FROM'),
  ADMIN_EMAIL:               requireVar('ADMIN_EMAIL'),
  ADMIN_EMAIL_2:             requireVar('ADMIN_EMAIL_2'),
  PORT:                      parseInt(process.env.PORT ?? '3000', 10),
  NODE_ENV:                  process.env.NODE_ENV ?? 'development',
} as const;
