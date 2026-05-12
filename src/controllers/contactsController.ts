// Contacts controller

import { Request, Response, NextFunction } from 'express';
import * as contactsService from '../services/contactsService';
import * as emailService from '../services/emailService';

export async function createContact(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const contact = await contactsService.createContact(req.body);
    emailService.sendContactAdminEmail(contact).catch(() => {});
    emailService.sendContactUserEmail(contact).catch(() => {});
    res.status(201).json({ success: true, message: 'Message sent successfully.', data: contact });
  } catch (err) {
    next(err);
  }
}

export async function listContacts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await contactsService.listContacts(req.query);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}
