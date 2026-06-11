// Questionnaire controller

import { Request, Response, NextFunction } from 'express';
import * as questionnaireService from '../services/questionnaireService';
import * as emailService from '../services/emailService';

export async function createSubmission(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, answers, result_type } = req.body;
    const submission = await questionnaireService.createSubmission({ email, answers, result_type });
    if (email && answers) {
      emailService.sendQuestionnaireAdminEmail({ email, answers }).catch(() => {});
    }
    res.status(201).json({ success: true, message: 'Questionnaire submitted.', data: submission });
  } catch (err) {
    next(err);
  }
}

export async function listSubmissions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await questionnaireService.listSubmissions(req.query);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}
