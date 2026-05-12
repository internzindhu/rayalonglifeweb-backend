// Vouchers router

import { Router } from 'express';
import { z } from 'zod';
import validate from '../middlewares/validate';
import requireAdmin from '../middlewares/requireAdmin';
import { leadCaptureRateLimit } from '../middlewares/rateLimit';
import * as vouchersController from '../controllers/vouchersController';

const router = Router();

const createVoucherSchema = z.object({
  body: z.object({
    quantity:            z.number().int().min(1),
    voucher_value:       z.number().int().min(1).optional(),
    custom_value:        z.number().int().min(1).optional(),
    sender_full_name:    z.string().min(2).max(100),
    sender_email:        z.string().email(),
    sender_contact:      z.string().optional(),
    receiver_first_name: z.string().min(1).max(100),
    receiver_last_name:  z.string().optional(),
    receiver_email:      z.string().email().optional(),
    receiver_contact:    z.string().optional(),
    receive_method:      z.string().optional(),
    invoice_to_company:  z.boolean().optional(),
    notes:               z.string().max(1000).optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

const statusSchema = z.object({
  body: z.object({ status: z.enum(['pending', 'issued', 'redeemed']) }),
  query: z.object({}).optional(),
  params: z.object({ id: z.string().uuid() }),
});

router.post('/', leadCaptureRateLimit, validate(createVoucherSchema), vouchersController.createVoucher);
router.get('/', requireAdmin, vouchersController.listVouchers);
router.patch('/:id/status', requireAdmin, validate(statusSchema), vouchersController.updateVoucherStatus);

export default router;
