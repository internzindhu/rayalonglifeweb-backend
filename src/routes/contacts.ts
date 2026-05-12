// Contacts router

import { Router } from 'express';
import { z } from 'zod';
import validate from '../middlewares/validate';
import requireAdmin from '../middlewares/requireAdmin';
import { leadCaptureRateLimit } from '../middlewares/rateLimit';
import * as contactsController from '../controllers/contactsController';

const router = Router();

const createContactSchema = z.object({
  body: z.object({
    name:    z.string().min(2).max(100),
    email:   z.string().email(),
    phone:   z.string().optional(),
    subject: z.string().max(200).optional(),
    message: z.string().min(10).max(5000),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

router.post('/', leadCaptureRateLimit, validate(createContactSchema), contactsController.createContact);
router.get('/', requireAdmin, contactsController.listContacts);

export default router;
