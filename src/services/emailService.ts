// Email service — Resend wrapper with one function per notification template.
// All sends are fire-and-forget; failures are logged but never thrown.

import { Resend } from 'resend';
import { env } from '../config/env';

const resend = new Resend(env.RESEND_API_KEY);

async function send(to: string | string[], subject: string, html: string): Promise<void> {
  try {
    await resend.emails.send({ from: env.EMAIL_FROM, to, subject, html });
  } catch (err) {
    console.error('[EmailService] Failed to send email:', { to, subject, error: err });
  }
}

function row(label: string, value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '';
  return `<tr><td style="padding:4px 8px;color:#666;">${label}</td><td style="padding:4px 8px;">${value}</td></tr>`;
}

function table(rows: string): string {
  return `<table style="border-collapse:collapse;font-family:sans-serif;font-size:14px;">${rows}</table>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function svgUri(svg: string): string {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

// ─── Branded template assets (shared) ──────────────────────────────────────────

const BRAND_PURPLE = '#5E17EB';
const BRAND_GOLD = '#C9A65B';
const BRAND_LAVENDER = '#F5F1FC';
const BRAND_DARK = '#181818';
const LOGO_URL = 'https://www.rayalonglife.com/logo.png';

const ICON_WHATSAPP_WHITE = svgUri(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ffffff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>`
);

const ICON_PHONE_WHITE = svgUri(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384"/></svg>`
);

const ICON_MAIL_WHITE = svgUri(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/><rect x="2" y="4" width="20" height="16" rx="2"/></svg>`
);

const ICON_FILE_SEARCH_PURPLE = svgUri(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${BRAND_PURPLE}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M4.268 21a2 2 0 0 0 1.727 1H18a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v3"/><path d="m9 18-1.5-1.5"/><circle cx="5" cy="14" r="3"/></svg>`
);

const ICON_GAUGE_PURPLE = svgUri(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${BRAND_PURPLE}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>`
);

const ICON_CALENDAR_CHECK_PURPLE = svgUri(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${BRAND_PURPLE}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="m9 16 2 2 4-4"/></svg>`
);

const ICON_FACEBOOK_WHITE = svgUri(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ffffff"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`
);

const ICON_INSTAGRAM_WHITE = svgUri(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ffffff"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`
);

const HEADER_WAVE = svgUri(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 42" preserveAspectRatio="none">` +
    `<path d="M0,0 C60,10 140,38 200,26 C260,14 340,14 400,26 C460,38 540,10 600,0 L600,0 L0,0 Z" fill="${BRAND_PURPLE}"/>` +
    `<path d="M0,4 C60,14 140,42 200,30 C260,18 340,18 400,30 C460,42 540,14 600,4" fill="none" stroke="${BRAND_GOLD}" stroke-width="2"/>` +
  `</svg>`
);

function stepCircle(icon: string, num: number, label: string): string {
  return `
    <td align="center" valign="top" style="padding:0 6px;">
      <table role="presentation" cellpadding="0" cellspacing="0" align="center"><tr><td align="center" valign="middle" style="width:20px;height:20px;border-radius:10px;background:${BRAND_PURPLE};color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;line-height:20px;">${num}</td></tr></table>
      <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin-top:6px;"><tr><td align="center" valign="middle" style="width:56px;height:56px;border-radius:28px;background:${BRAND_LAVENDER};">
        <img src="${icon}" width="24" height="24" alt="" style="display:block;margin:16px auto;" />
      </td></tr></table>
      <p style="margin:10px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:17px;color:#374151;max-width:120px;">${label}</p>
    </td>`;
}

function arrowCell(): string {
  return `<td width="28" align="center" valign="middle" style="color:${BRAND_GOLD};font-size:16px;font-family:Arial,sans-serif;">&#8594;</td>`;
}

function firstNameWithLastInitial(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[1][0].toUpperCase()}`;
}

const PREFERRED_CONTACT_META: Record<string, { label: string; icon: string }> = {
  call: { label: 'Call', icon: ICON_PHONE_WHITE },
  whatsapp: { label: 'WhatsApp', icon: ICON_WHATSAPP_WHITE },
  email: { label: 'Email', icon: ICON_MAIL_WHITE },
};

function formatPreferredContact(raw: string | null | undefined): { label: string; icon: string } {
  const methods = (raw ?? '')
    .split(',')
    .map((m) => m.trim().toLowerCase())
    .filter(Boolean);
  if (methods.length === 0) return { label: 'Email', icon: ICON_MAIL_WHITE };
  const labels = methods.map((m) => PREFERRED_CONTACT_META[m]?.label ?? m);
  const label =
    labels.length === 1
      ? labels[0]
      : `${labels.slice(0, -1).join(', ')} & ${labels[labels.length - 1]}`;
  const icon = PREFERRED_CONTACT_META[methods[0]]?.icon ?? ICON_MAIL_WHITE;
  return { label, icon };
}

// ─── Inquiries ────────────────────────────────────────────────────────────────

export interface InquiryEmailData {
  full_name: string;
  email: string;
  hotel_name: string;
  date_from?: unknown;
  date_to?: unknown;
  room_type?: string | null;
  people?: number | null;
  country?: string | null;
  mobile?: string | null;
  comment?: string | null;
  total_price?: string | null;
}

export async function sendInquiryAdminEmail(inquiry: InquiryEmailData): Promise<void> {
  const html = `
    <h2 style="font-family:sans-serif;">New Inquiry — ${inquiry.hotel_name}</h2>
    ${table([
      row('Hotel', inquiry.hotel_name),
      row('Guest', inquiry.full_name),
      row('Email', inquiry.email),
      row('Mobile', inquiry.mobile),
      row('Country', inquiry.country),
      row('Date From', inquiry.date_from ? String(inquiry.date_from) : null),
      row('Date To', inquiry.date_to ? String(inquiry.date_to) : null),
      row('Room Type', inquiry.room_type),
      row('Guests', inquiry.people),
      row('Total Price', inquiry.total_price),
      row('Comments', inquiry.comment),
    ].join(''))}
  `;
  await send(env.ADMIN_EMAIL, `New Inquiry: ${inquiry.hotel_name}`, html);
}

export async function sendInquiryUserEmail(inquiry: InquiryEmailData): Promise<void> {
  const html = `
    <h2 style="font-family:sans-serif;">Thank you for your inquiry, ${inquiry.full_name}!</h2>
    <p style="font-family:sans-serif;">We have received your inquiry for <strong>${inquiry.hotel_name}</strong> and will be in touch shortly.</p>
    ${table([
      row('Hotel', inquiry.hotel_name),
      row('Date From', inquiry.date_from ? String(inquiry.date_from) : null),
      row('Date To', inquiry.date_to ? String(inquiry.date_to) : null),
      row('Room Type', inquiry.room_type),
      row('Guests', inquiry.people),
    ].join(''))}
    <p style="font-family:sans-serif;color:#666;">If you have questions, reply to this email or contact us directly.</p>
  `;
  await send(inquiry.email, `Your inquiry for ${inquiry.hotel_name} — RAYA`, html);
}

// ─── Consultations ────────────────────────────────────────────────────────────

export interface ConsultationEmailData {
  name: string;
  email: string;
  mobile?: string | null;
  country?: string | null;
  travel_month?: string | null;
  budget_min?: string | null;
  budget_max?: string | null;
  number_of_nights?: number | null;
  preferred_contact?: string | null;
  schedule_datetime?: unknown;
  comment?: string | null;
}

export async function sendConsultationAdminEmail(c: ConsultationEmailData): Promise<void> {
  const html = `
    <h2 style="font-family:sans-serif;">New Consultation Request</h2>
    ${table([
      row('Name', c.name),
      row('Email', c.email),
      row('Mobile', c.mobile),
      row('Country', c.country),
      row('Travel Month', c.travel_month),
      row('Budget Min', c.budget_min),
      row('Budget Max', c.budget_max),
      row('Nights', c.number_of_nights),
      row('Preferred Contact', c.preferred_contact),
      row('Scheduled', c.schedule_datetime ? String(c.schedule_datetime) : null),
      row('Comments', c.comment),
    ].join(''))}
  `;
  await send(env.ADMIN_EMAIL_2, `New Consultation Request: ${c.name}`, html);
}

export function buildConsultationUserEmailHtml(c: ConsultationEmailData): string {
  const displayName = escapeHtml(firstNameWithLastInitial(c.name));
  const preferred = formatPreferredContact(c.preferred_contact);
  const preferredLabel = escapeHtml(preferred.label);

  const steps = [
    stepCircle(ICON_FILE_SEARCH_PURPLE, 1, 'We review<br/>your request'),
    arrowCell(),
    stepCircle(ICON_GAUGE_PURPLE, 2, 'Our expert will<br/>get in touch'),
    arrowCell(),
    stepCircle(ICON_CALENDAR_CHECK_PURPLE, 3, 'We help you plan your<br/>perfect wellness retreat'),
  ].join('');

  const html = `
<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#EDEDED;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EDEDED;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background:#ffffff;">

            <!-- Header -->
            <tr>
              <td style="background:${BRAND_PURPLE};padding:36px 24px 26px;" align="center">
                <img src="${LOGO_URL}" width="150" alt="Raya Longlife" style="display:block;max-width:150px;" />
              </td>
            </tr>
            <tr>
              <td style="line-height:0;font-size:0;">
                <img src="${HEADER_WAVE}" width="600" height="42" alt="" style="display:block;width:100%;height:auto;" />
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:40px 32px 8px;">
                <h1 style="margin:0 0 16px;text-align:center;font-family:Georgia,'Times New Roman',serif;font-size:28px;line-height:1.3;color:${BRAND_DARK};">
                  Thank you, <span style="color:${BRAND_PURPLE};">${displayName}!</span>
                </h1>
                <p style="margin:0 0 32px;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;color:#4B5563;">
                  We've received your consultation request and will contact you soon via your preferred method.
                </p>

                <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:0 auto 40px;">
                  <tr>
                    <td style="width:48px;height:48px;background:${BRAND_PURPLE};border-radius:10px;" align="center" valign="middle">
                      <img src="${preferred.icon}" width="22" height="22" alt="" style="display:block;" />
                    </td>
                    <td style="padding-left:14px;" valign="middle" align="left">
                      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#6B7280;">Preferred contact:</p>
                      <p style="margin:2px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:700;color:${BRAND_PURPLE};">${preferredLabel}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- What happens next -->
            <tr>
              <td style="padding:0 32px 40px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND_LAVENDER};border-radius:16px;">
                  <tr>
                    <td style="padding:32px 20px;">
                      <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:0 auto 28px;">
                        <tr>
                          <td style="width:36px;border-top:1px solid ${BRAND_GOLD};font-size:0;line-height:0;">&nbsp;</td>
                          <td style="padding:0 12px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;color:${BRAND_DARK};white-space:nowrap;">What happens next?</td>
                          <td style="width:36px;border-top:1px solid ${BRAND_GOLD};font-size:0;line-height:0;">&nbsp;</td>
                        </tr>
                      </table>
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                        <tr>${steps}</tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Closing -->
            <tr>
              <td style="padding:0 32px 40px;text-align:center;">
                <p style="margin:0 0 6px;font-family:Georgia,'Times New Roman',serif;font-size:17px;font-weight:700;color:${BRAND_PURPLE};">We appreciate your trust in Raya Long Life.</p>
                <p style="margin:0 0 24px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#4B5563;">We look forward to helping you on your wellness journey.</p>
                <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#4B5563;">With care,</p>
                <table role="presentation" cellpadding="0" cellspacing="0" align="center">
                  <tr>
                    <td style="font-family:'Brush Script MT',cursive;font-style:italic;font-size:24px;color:${BRAND_PURPLE};border-bottom:2px solid ${BRAND_GOLD};padding:0 4px 4px;">Raya Long Life Team</td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:${BRAND_LAVENDER};padding:28px 32px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td valign="top" style="font-family:Arial,Helvetica,sans-serif;">
                      <p style="margin:0 0 6px;font-weight:700;color:${BRAND_DARK};font-size:13px;">General Enquiries</p>
                      <p style="margin:0;color:#374151;font-size:12px;line-height:18px;">hello@rayalonglife.com</p>
                      <p style="margin:0;color:#374151;font-size:12px;line-height:18px;">+94 74 413 5358</p>
                    </td>
                    <td valign="top" style="font-family:Arial,Helvetica,sans-serif;">
                      <p style="margin:0 0 6px;font-weight:700;color:${BRAND_DARK};font-size:13px;">Customer support</p>
                      <p style="margin:0;color:#374151;font-size:12px;line-height:18px;">healing@rayalonglife.com</p>
                      <p style="margin:0;color:#374151;font-size:12px;line-height:18px;">+94 74 413 5357</p>
                    </td>
                    <td valign="top" align="right" style="font-family:Arial,Helvetica,sans-serif;">
                      <p style="margin:0 0 10px;font-weight:700;color:${BRAND_DARK};font-size:12px;letter-spacing:1px;">FOLLOW US ON</p>
                      <a href="https://facebook.com" style="display:inline-block;width:34px;height:34px;background:${BRAND_PURPLE};border-radius:8px;text-align:center;line-height:34px;margin-right:8px;">
                        <img src="${ICON_FACEBOOK_WHITE}" width="15" height="15" alt="Facebook" style="vertical-align:middle;" />
                      </a>
                      <a href="https://instagram.com" style="display:inline-block;width:34px;height:34px;background:${BRAND_PURPLE};border-radius:8px;text-align:center;line-height:34px;">
                        <img src="${ICON_INSTAGRAM_WHITE}" width="15" height="15" alt="Instagram" style="vertical-align:middle;" />
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
  return html;
}

export async function sendConsultationUserEmail(c: ConsultationEmailData): Promise<void> {
  const html = buildConsultationUserEmailHtml(c);
  await send(c.email, 'Your consultation request — RAYA', html);
}

// ─── Contacts ────────────────────────────────────────────────────────────────

export interface ContactEmailData {
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
}

export async function sendContactAdminEmail(c: ContactEmailData): Promise<void> {
  const html = `
    <h2 style="font-family:sans-serif;">New Contact Message</h2>
    ${table([
      row('Name', c.name),
      row('Email', c.email),
      row('Phone', c.phone),
      row('Subject', c.subject),
      row('Message', c.message),
    ].join(''))}
  `;
  await send(env.ADMIN_EMAIL, `Contact: ${c.subject ?? c.name}`, html);
}

export async function sendContactUserEmail(c: ContactEmailData): Promise<void> {
  const html = `
    <h2 style="font-family:sans-serif;">Thanks for reaching out, ${c.name}!</h2>
    <p style="font-family:sans-serif;">We received your message and will get back to you as soon as possible.</p>
  `;
  await send(c.email, 'We received your message — RAYA', html);
}

// ─── Vouchers ─────────────────────────────────────────────────────────────────

export interface VoucherEmailData {
  sender_full_name: string;
  sender_email: string;
  receiver_first_name: string;
  receiver_last_name?: string | null;
  receiver_email?: string | null;
  quantity: number;
  voucher_value?: number | null;
  custom_value?: number | null;
  notes?: string | null;
}

export async function sendVoucherAdminEmail(v: VoucherEmailData): Promise<void> {
  const html = `
    <h2 style="font-family:sans-serif;">New Voucher Order</h2>
    ${table([
      row('Sender', v.sender_full_name),
      row('Sender Email', v.sender_email),
      row('Receiver', `${v.receiver_first_name} ${v.receiver_last_name ?? ''}`),
      row('Receiver Email', v.receiver_email),
      row('Quantity', v.quantity),
      row('Voucher Value', v.voucher_value),
      row('Custom Value', v.custom_value),
      row('Notes', v.notes),
    ].join(''))}
  `;
  await send(env.ADMIN_EMAIL, `New Voucher Order from ${v.sender_full_name}`, html);
}

export async function sendVoucherSenderEmail(v: VoucherEmailData): Promise<void> {
  const html = `
    <h2 style="font-family:sans-serif;">Your voucher order is confirmed, ${v.sender_full_name}!</h2>
    <p style="font-family:sans-serif;">We're processing your gift voucher order. You'll hear from us once it's issued.</p>
    ${table([
      row('Recipient', `${v.receiver_first_name} ${v.receiver_last_name ?? ''}`),
      row('Quantity', v.quantity),
      row('Value', v.voucher_value ?? v.custom_value),
    ].join(''))}
  `;
  await send(v.sender_email, 'Your RAYA voucher order — confirmation', html);
}

export async function sendVoucherReceiverEmail(v: VoucherEmailData): Promise<void> {
  if (!v.receiver_email) return;
  const html = `
    <h2 style="font-family:sans-serif;">You've received a gift from ${v.sender_full_name}!</h2>
    <p style="font-family:sans-serif;">A RAYA wellness gift voucher has been ordered for you. We'll be in touch with the voucher details shortly.</p>
  `;
  await send(v.receiver_email, `A gift for you from ${v.sender_full_name} — RAYA`, html);
}

// ─── Newsletter ───────────────────────────────────────────────────────────────

export async function sendNewsletterWelcomeEmail(email: string): Promise<void> {
  const html = `
    <h2 style="font-family:sans-serif;">Welcome to The RAYA Letter!</h2>
    <p style="font-family:sans-serif;">Thank you for subscribing. Your first issue arrives next month — ancient wisdom for modern lives, delivered once a month.</p>
    <p style="font-family:sans-serif;color:#666;">If you didn't subscribe, you can safely ignore this email.</p>
  `;
  await send(email, 'Welcome to The RAYA Letter', html);
}

// ─── Call an Expert ───────────────────────────────────────────────────────────

export interface CallExpertEmailData {
  name: string;
  email: string;
  phone: string;
  scheduled_date?: string;
  scheduled_slot?: string;
}

export async function sendCallExpertAdminEmail(c: CallExpertEmailData): Promise<void> {
  const isScheduled = !!(c.scheduled_date && c.scheduled_slot);
  const subject = isScheduled
    ? `Scheduled Call: ${c.name} — ${c.scheduled_date} ${c.scheduled_slot}`
    : `New Call Request: ${c.name}`;
  const html = `
    <h2 style="font-family:sans-serif;">${isScheduled ? 'Scheduled Call Request' : 'New Call Expert Request'}</h2>
    ${table([
      row('Name', c.name),
      row('Email', c.email),
      row('Phone', c.phone),
      row('Scheduled Date', c.scheduled_date),
      row('Scheduled Slot', c.scheduled_slot),
    ].join(''))}
  `;
  await send(env.ADMIN_EMAIL, subject, html);
}

// ─── Questionnaire ────────────────────────────────────────────────────────────

export interface QuestionnaireEmailData {
  email: string;
  answers: Record<string, unknown>;
}

export async function sendQuestionnaireAdminEmail(q: QuestionnaireEmailData): Promise<void> {
  const answerRows = Object.entries(q.answers)
    .map(([question, answer]) => row(question, Array.isArray(answer) ? answer.join(', ') : String(answer ?? '')))
    .join('');
  const html = `
    <h2 style="font-family:sans-serif;">New Questionnaire Submission</h2>
    ${table(row('Email', q.email) + answerRows)}
  `;
  await send(env.ADMIN_EMAIL, `New Questionnaire from ${q.email}`, html);
}
