// Admin auth middleware — verifies Supabase JWT (HS256) and checks app_metadata.role === 'admin'

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: { id: string; email: string; role: string };
    }
  }
}

export default function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ status: 401, message: 'Unauthorized' });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, env.SUPABASE_JWT_SECRET, {
      algorithms: ['HS256'],
    }) as jwt.JwtPayload;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const role = (payload as any).app_metadata?.role as string | undefined;
    if (role !== 'admin') {
      res.status(401).json({ status: 401, message: 'Unauthorized' });
      return;
    }

    req.user = {
      id: payload.sub ?? '',
      email: (payload.email as string | undefined) ?? '',
      role,
    };

    next();
  } catch {
    res.status(401).json({ status: 401, message: 'Unauthorized' });
  }
}
