// Email campaigns router — admin-only management of Resend audiences,
// contacts, and newsletter broadcasts. Fully separate from /api/newsletter
// (which only handles our own subscriber list) to avoid route collisions
// and keep the two concerns distinct.

import { Router } from 'express';
import { z } from 'zod';
import validate from '../middlewares/validate';
import requireAdmin from '../middlewares/requireAdmin';
import * as controller from '../controllers/emailCampaignsController';

const router = Router();

router.use(requireAdmin);

const audienceIdParams = z.object({
  params: z.object({ audienceId: z.string().min(1) }),
  query:  z.object({}).passthrough(),
  body:   z.object({}).passthrough(),
});

const createAudienceSchema = z.object({
  body:   z.object({ name: z.string().min(1).max(200) }),
  query:  z.object({}).optional(),
  params: z.object({}).optional(),
});

const addContactSchema = z.object({
  params: z.object({ audienceId: z.string().min(1) }),
  body: z.object({
    email:     z.string().email(),
    firstName: z.string().optional(),
    lastName:  z.string().optional(),
  }),
  query: z.object({}).optional(),
});

const contactIdParams = z.object({
  params: z.object({ audienceId: z.string().min(1), contactId: z.string().min(1) }),
  query:  z.object({}).passthrough(),
  body:   z.object({}).passthrough(),
});

const broadcastIdParams = z.object({
  params: z.object({ broadcastId: z.string().min(1) }),
  query:  z.object({}).passthrough(),
  body:   z.object({}).passthrough(),
});

const createBroadcastSchema = z.object({
  body: z.object({
    audienceId: z.string().min(1),
    subject:    z.string().min(1).max(300),
    body:       z.string().min(1),
    name:       z.string().optional(),
  }),
  query:  z.object({}).optional(),
  params: z.object({}).optional(),
});

router.get('/audiences', controller.listAudiences);
router.post('/audiences', validate(createAudienceSchema), controller.createAudience);
router.delete('/audiences/:audienceId', validate(audienceIdParams), controller.deleteAudience);

router.get('/audiences/:audienceId/contacts', validate(audienceIdParams), controller.listContacts);
router.post('/audiences/:audienceId/contacts', validate(addContactSchema), controller.addContact);
router.delete('/audiences/:audienceId/contacts/:contactId', validate(contactIdParams), controller.removeContact);
router.post('/audiences/:audienceId/sync-subscribers', validate(audienceIdParams), controller.syncSubscribers);

router.get('/broadcasts', controller.listBroadcasts);
router.get('/broadcasts/:broadcastId', validate(broadcastIdParams), controller.getBroadcast);
router.post('/broadcasts', validate(createBroadcastSchema), controller.createBroadcast);
router.post('/broadcasts/:broadcastId/send', validate(broadcastIdParams), controller.sendBroadcast);

export default router;
