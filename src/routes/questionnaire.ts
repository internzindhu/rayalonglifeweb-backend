// Questionnaire router

import { Router } from 'express';
import { z } from 'zod';
import validate from '../middlewares/validate';
import requireAdmin from '../middlewares/requireAdmin';
import { leadCaptureRateLimit } from '../middlewares/rateLimit';
import * as questionnaireController from '../controllers/questionnaireController';

const router = Router();

const createSubmissionSchema = z.object({
  body: z.object({
    email:       z.string().email().optional(),
    answers:     z.record(z.unknown()),
    result_type: z.string().optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

router.post('/', leadCaptureRateLimit, validate(createSubmissionSchema), questionnaireController.createSubmission);
router.get('/', requireAdmin, questionnaireController.listSubmissions);

export default router;
