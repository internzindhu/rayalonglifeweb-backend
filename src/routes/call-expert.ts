import { Router } from 'express';
import { z } from 'zod';
import validate from '../middlewares/validate';
import requireAdmin from '../middlewares/requireAdmin';
import { leadCaptureRateLimit } from '../middlewares/rateLimit';
import * as callExpertController from '../controllers/callExpertController';

const router = Router();

const createSchema = z.object({
  body: z.object({
    phone:          z.string().min(1),
    name:           z.string().min(1),
    email:          z.string().email(),
    scheduled_date: z.string().optional(),
    scheduled_slot: z.string().optional(),
  }),
  query:  z.object({}).optional(),
  params: z.object({}).optional(),
});

router.post('/', leadCaptureRateLimit, validate(createSchema), callExpertController.createCallExpert);
router.get('/', requireAdmin, callExpertController.listCallExperts);

export default router;
