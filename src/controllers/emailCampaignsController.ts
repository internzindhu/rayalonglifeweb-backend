// Email campaigns controller — admin management of Resend audiences,
// contacts, and newsletter broadcasts.

import { Request, Response, NextFunction } from 'express';
import * as resendCampaignService from '../services/resendCampaignService';
import { buildBroadcastHtml } from '../services/emailService';

export async function listAudiences(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const audiences = await resendCampaignService.listAudiences();
    res.status(200).json({ success: true, data: audiences });
  } catch (err) {
    next(err);
  }
}

export async function createAudience(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const audience = await resendCampaignService.createAudience(req.body.name);
    res.status(201).json({ success: true, data: audience });
  } catch (err) {
    next(err);
  }
}

export async function deleteAudience(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await resendCampaignService.deleteAudience(req.params.audienceId);
    res.status(200).json({ success: true, message: 'Audience deleted.' });
  } catch (err) {
    next(err);
  }
}

export async function listContacts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const contacts = await resendCampaignService.listContacts(req.params.audienceId);
    res.status(200).json({ success: true, data: contacts });
  } catch (err) {
    next(err);
  }
}

export async function addContact(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, firstName, lastName } = req.body;
    const contact = await resendCampaignService.addContact(req.params.audienceId, email, firstName, lastName);
    res.status(201).json({ success: true, data: contact });
  } catch (err) {
    next(err);
  }
}

export async function removeContact(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await resendCampaignService.removeContact(req.params.audienceId, req.params.contactId);
    res.status(200).json({ success: true, message: 'Contact removed.' });
  } catch (err) {
    next(err);
  }
}

export async function syncSubscribers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await resendCampaignService.syncAllSubscribers(req.params.audienceId);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function listBroadcasts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const broadcasts = await resendCampaignService.listBroadcasts();
    res.status(200).json({ success: true, data: broadcasts });
  } catch (err) {
    next(err);
  }
}

export async function getBroadcast(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const broadcast = await resendCampaignService.getBroadcast(req.params.broadcastId);
    res.status(200).json({ success: true, data: broadcast });
  } catch (err) {
    next(err);
  }
}

export async function createBroadcast(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { audienceId, subject, body, name, from, media } = req.body;
    const html = buildBroadcastHtml(subject, body, media);
    const broadcast = await resendCampaignService.createBroadcast({
      audienceId,
      subject,
      html,
      from,
      name: name || subject,
    });
    res.status(201).json({ success: true, data: broadcast });
  } catch (err) {
    next(err);
  }
}

export async function sendBroadcast(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await resendCampaignService.sendBroadcast(req.params.broadcastId);
    res.status(200).json({ success: true, message: 'Broadcast sent.' });
  } catch (err) {
    next(err);
  }
}
