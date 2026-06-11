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

export async function sendConsultationUserEmail(c: ConsultationEmailData): Promise<void> {
  const html = `
    <h2 style="font-family:sans-serif;">Thank you, ${c.name}!</h2>
    <p style="font-family:sans-serif;">We've received your consultation request and will contact you soon via your preferred method.</p>
    <p style="font-family:sans-serif;color:#666;">Preferred contact: <strong>${c.preferred_contact ?? 'email'}</strong></p>
  `;
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
