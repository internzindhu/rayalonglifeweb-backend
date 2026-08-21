// One-off CLI script to create (or promote) a Supabase Auth user as an admin
// for the raya-admin portal. Run locally — never expose the service role key
// used here to the browser or to raya-admin itself.
//
// Usage:
//   npm run create-admin -- --email=you@example.com --password=SomeStrongPass123
//
// If a user with that email already exists, this promotes them to admin
// (sets app_metadata.role = 'admin') instead of failing.

import 'dotenv/config';
import { supabase } from '../config/supabase';

function parseArgs(): { email?: string; password?: string } {
  const args: Record<string, string> = {};
  for (const arg of process.argv.slice(2)) {
    const match = /^--([^=]+)=(.*)$/.exec(arg);
    if (match) args[match[1]] = match[2];
  }
  return { email: args.email, password: args.password };
}

async function findUserByEmail(email: string) {
  // supabase-js v2 has no direct getUserByEmail; page through admin.listUsers.
  let page = 1;
  const perPage = 200;
  for (;;) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const found = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (found) return found;
    if (data.users.length < perPage) return null;
    page += 1;
  }
}

async function main() {
  const { email, password } = parseArgs();
  if (!email || !password) {
    console.error('Usage: npm run create-admin -- --email=you@example.com --password=SomeStrongPass123');
    process.exit(1);
  }
  if (password.length < 8) {
    console.error('Password must be at least 8 characters.');
    process.exit(1);
  }

  const existing = await findUserByEmail(email);

  if (existing) {
    const { error } = await supabase.auth.admin.updateUserById(existing.id, {
      app_metadata: { ...existing.app_metadata, role: 'admin' },
    });
    if (error) throw error;
    console.log(`Existing user ${email} promoted to admin (role=admin in app_metadata).`);
    return;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { role: 'admin' },
  });
  if (error) throw error;
  console.log(`Admin user created: ${data.user?.email} (id: ${data.user?.id})`);
}

main()
  .catch((err) => {
    console.error('Failed to create/promote admin user:', err instanceof Error ? err.message : err);
    process.exit(1);
  })
  .then(() => process.exit(0));
