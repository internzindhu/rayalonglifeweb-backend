// Resend campaign service — wraps the Resend Audiences/Contacts APIs (typed
// SDK methods) and the Broadcasts API (raw REST — the installed SDK version
// has no typed `broadcasts` client yet, so we call `resend.post`/`get`
// directly against the same endpoints the SDK would otherwise wrap).

import { Resend } from 'resend';
import { env } from '../config/env';
import { AppError } from '../middlewares/errorHandler';
import prisma from '../config/database';

const resend = new Resend(env.RESEND_API_KEY);

const DEFAULT_AUDIENCE_NAME = 'Newsletter Subscribers';

function fail(error: { message: string } | null): never {
  throw new AppError(error?.message ?? 'Resend request failed.', 502);
}

// ─── Audiences ────────────────────────────────────────────────────────────────

export interface ResendAudience {
  id:         string;
  name:       string;
  created_at: string;
}

export async function listAudiences(): Promise<ResendAudience[]> {
  const { data, error } = await resend.audiences.list();
  if (error) fail(error);
  return data?.data ?? [];
}

export async function createAudience(name: string) {
  const { data, error } = await resend.audiences.create({ name });
  if (error) fail(error);
  return data;
}

export async function deleteAudience(audienceId: string): Promise<void> {
  const { error } = await resend.audiences.remove(audienceId);
  if (error) fail(error);
}

// Newsletter signups auto-join this audience; cached in-process for the life
// of the server so we don't list-or-create on every single subscription.
let defaultAudienceId: string | null = null;

export async function getOrCreateDefaultAudienceId(): Promise<string> {
  if (defaultAudienceId) return defaultAudienceId;

  const audiences = await listAudiences();
  const existing = audiences.find((a) => a.name === DEFAULT_AUDIENCE_NAME);
  if (existing) {
    defaultAudienceId = existing.id;
    return existing.id;
  }

  const created = await createAudience(DEFAULT_AUDIENCE_NAME);
  if (!created) throw new AppError('Failed to create default Resend audience.', 502);
  defaultAudienceId = created.id;
  return created.id;
}

// ─── Contacts ─────────────────────────────────────────────────────────────────

export interface ResendContact {
  id:            string;
  email:         string;
  first_name?:   string;
  last_name?:    string;
  unsubscribed:  boolean;
  created_at:    string;
}

export async function listContacts(audienceId: string): Promise<ResendContact[]> {
  const { data, error } = await resend.contacts.list({ audienceId });
  if (error) fail(error);
  return data?.data ?? [];
}

export async function addContact(
  audienceId: string,
  email: string,
  firstName?: string,
  lastName?: string,
): Promise<unknown> {
  const { data, error } = await resend.contacts.create({ audienceId, email, firstName, lastName });
  if (error) fail(error);
  return data;
}

export async function removeContact(audienceId: string, contactId: string): Promise<void> {
  const { error } = await resend.contacts.remove({ audienceId, id: contactId });
  if (error) fail(error);
}

/**
 * Adds a newly subscribed email to the default audience. Never throws —
 * mirrors the "fire and forget" pattern used for transactional email sends,
 * so a Resend hiccup can never block a newsletter signup.
 */
export async function syncNewSubscriberToResend(email: string): Promise<void> {
  try {
    const audienceId = await getOrCreateDefaultAudienceId();
    await addContact(audienceId, email);
  } catch (err) {
    console.error('[ResendCampaignService] Failed to sync subscriber to Resend:', { email, error: err });
  }
}

/**
 * One-time (or repeatable) backfill: adds every subscriber currently in our
 * own database to the given audience. Resend treats a duplicate email as an
 * upsert, so this is safe to re-run.
 */
export async function syncAllSubscribers(audienceId: string): Promise<{ synced: number; failed: number }> {
  const subscribers = await prisma.newsletterSubscriber.findMany({ select: { email: true } });
  let synced = 0;
  let failed = 0;
  for (const { email } of subscribers) {
    try {
      await addContact(audienceId, email);
      synced += 1;
    } catch {
      failed += 1;
    }
  }
  return { synced, failed };
}

// ─── Broadcasts ───────────────────────────────────────────────────────────────

export interface BroadcastRecord {
  id: string;
  name?: string;
  audience_id?: string;
  status?: string;
  subject?: string;
  created_at?: string;
  scheduled_at?: string | null;
  sent_at?: string | null;
}

export async function createBroadcast(params: {
  audienceId: string;
  name: string;
  subject: string;
  html: string;
}): Promise<BroadcastRecord> {
  const { data, error } = await resend.post<BroadcastRecord>('/broadcasts', {
    audience_id: params.audienceId,
    from:        env.EMAIL_FROM,
    subject:     params.subject,
    html:        params.html,
    name:        params.name,
  });
  if (error) fail(error);
  if (!data) throw new AppError('Resend returned no broadcast data.', 502);
  return data;
}

export async function sendBroadcast(broadcastId: string): Promise<void> {
  const { error } = await resend.post(`/broadcasts/${broadcastId}/send`, {});
  if (error) fail(error);
}

export async function listBroadcasts(): Promise<BroadcastRecord[]> {
  const { data, error } = await resend.get<{ data: BroadcastRecord[] }>('/broadcasts');
  if (error) fail(error);
  return data?.data ?? [];
}

export async function getBroadcast(broadcastId: string): Promise<BroadcastRecord> {
  const { data, error } = await resend.get<BroadcastRecord>(`/broadcasts/${broadcastId}`);
  if (error) fail(error);
  if (!data) throw new AppError(`Broadcast "${broadcastId}" not found.`, 404);
  return data;
}
