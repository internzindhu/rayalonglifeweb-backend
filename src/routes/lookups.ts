// Lookups router — public read, admin write

import { Router } from 'express';
import { z } from 'zod';
import validate from '../middlewares/validate';
import requireAdmin from '../middlewares/requireAdmin';
import * as lookupsController from '../controllers/lookupsController';

const router = Router();

const createLookupSchema = z.object({
  body: z.object({ name: z.string().min(1).max(200) }),
  query: z.object({}).optional(),
  params: z.object({ name: z.string() }),
});

const updateLookupSchema = z.object({
  body: z.object({ name: z.string().min(1).max(200) }),
  query: z.object({}).optional(),
  params: z.object({ name: z.string(), id: z.string().regex(/^\d+$/) }),
});

router.get('/', lookupsController.getAllLookups);
router.get('/:name', lookupsController.getLookup);
router.post('/:name', requireAdmin, validate(createLookupSchema), lookupsController.createLookup);
router.put('/:name/:id', requireAdmin, validate(updateLookupSchema), lookupsController.updateLookup);
router.delete('/:name/:id', requireAdmin, lookupsController.deleteLookup);

export default router;
