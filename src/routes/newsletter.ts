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

router.post('/', leadCaptureRateLimit, validate(subscribeSchema), newsletterController.subscribe);
router.get('/', requireAdmin, newsletterController.listSubscribers);

export default router;
