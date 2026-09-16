import { Request, Response, NextFunction } from 'express';
import * as newsletterService from '../services/newsletterService';
import * as emailService from '../services/emailService';
import * as resendCampaignService from '../services/resendCampaignService';

export async function subscribe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email } = req.body;
    await newsletterService.subscribe(email);
    emailService.sendNewsletterWelcomeEmail(email).catch(() => {});
    resendCampaignService.syncNewSubscriberToResend(email);
    res.status(201).json({ success: true, message: 'Subscribed successfully.' });
  } catch (err) {
    next(err);
  }
}

export async function listSubscribers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await newsletterService.listSubscribers(req.query);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function deleteSubscriber(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await newsletterService.deleteSubscriber(req.params.id);
    res.status(200).json({ success: true, message: 'Subscriber deleted.' });
  } catch (err) {
    next(err);
  }
}
