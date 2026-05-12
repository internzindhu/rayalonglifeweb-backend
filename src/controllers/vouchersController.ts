// Vouchers controller

import { Request, Response, NextFunction } from 'express';
import * as vouchersService from '../services/vouchersService';
import * as emailService from '../services/emailService';

export async function createVoucher(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const voucher = await vouchersService.createVoucher(req.body);
    emailService.sendVoucherAdminEmail(voucher).catch(() => {});
    emailService.sendVoucherSenderEmail(voucher).catch(() => {});
    emailService.sendVoucherReceiverEmail(voucher).catch(() => {});
    res.status(201).json({ success: true, message: 'Voucher order received.', data: voucher });
  } catch (err) {
    next(err);
  }
}

export async function listVouchers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await vouchersService.listVouchers(req.query);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function updateVoucherStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const voucher = await vouchersService.updateVoucherStatus(req.params.id, req.body.status);
    res.status(200).json({ success: true, data: voucher });
  } catch (err) {
    next(err);
  }
}
