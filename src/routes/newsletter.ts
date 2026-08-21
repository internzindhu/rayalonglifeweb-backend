import { Router } from 'express';
import { z } from 'zod';
import validate from '../middlewares/validate';
import requireAdmin from '../middlewares/requireAdmin';
import { leadCaptureRateLimit } from '../middlewares/rateLimit';
import * as newsletterController from '../controllers/newsletterController';

const router = Router();

const subscribeSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
  query:  z.object({}).optional(),
  params: z.object({}).optional(),
});

const idParamSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({ id: z.string().uuid() }),
});

router.post('/', leadCaptureRateLimit, validate(subscribeSchema), newsletterController.subscribe);
router.get('/', requireAdmin, newsletterController.listSubscribers);
router.delete('/:id', requireAdmin, validate(idParamSchema), newsletterController.deleteSubscriber);

export default router;
