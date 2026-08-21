// Admin auth middleware — verifies Supabase session JWTs and checks
// app_metadata.role === 'admin'.
//
// Supabase projects created (or migrated) after the JWT Signing Keys rollout
// sign session tokens asymmetrically (ES256 / P-256) rather than with the
// legacy shared HS256 secret, so the primary verification path here uses the
// project's public JWKS. The legacy HS256 path is kept as a fallback only —
// see the comment above that branch.

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';
import { env } from '../config/env';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: { id: string; email: string; role: string };
    }
  }
}

// jose caches the fetched key set internally (and de-dupes concurrent
// fetches / respects a cooldown between refetches), so this can safely be a
// module-level singleton reused across requests.
const jwks = createRemoteJWKSet(new URL(`${env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`));

function extractRole(payload: JWTPayload): string | undefined {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (payload as any).app_metadata?.role as string | undefined;
}

function toUser(payload: JWTPayload, role: string) {
  return {
    id: payload.sub ?? '',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    email: ((payload as any).email as string | undefined) ?? '',
    role,
  };
}

export default async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ status: 401, message: 'Unauthorized' });
    return;
  }

  const token = authHeader.slice(7);

  // Primary path: verify against Supabase's current signing keys (ES256,
  // fetched from the project's JWKS endpoint).
  try {
    const { payload } = await jwtVerify(token, jwks, { algorithms: ['ES256'] });
    const role = extractRole(payload);
    if (role !== 'admin') {
      res.status(401).json({ status: 401, message: 'Unauthorized' });
      return;
    }
    req.user = toUser(payload, role);
    next();
    return;
  } catch (jwksErr) {
    console.error(
      '[requireAdmin] JWKS (ES256) verification failed:',
      jwksErr instanceof Error ? jwksErr.message : jwksErr,
    );
  }

  // Fallback path: legacy HS256 shared-secret tokens. Only relevant for
  // sessions that were issued before this project's JWT signing-key
  // rotation and haven't expired/refreshed since — Supabase session tokens
  // are short-lived, so in practice this branch should stop matching
  // anything shortly after the rotation. Kept only as a safety net; remove
  // once confirmed nothing is hitting it.
  try {
    const payload = jwt.verify(token, env.SUPABASE_JWT_SECRET, {
      algorithms: ['HS256'],
    }) as jwt.JwtPayload;

    const role = extractRole(payload);
    if (role !== 'admin') {
      res.status(401).json({ status: 401, message: 'Unauthorized' });
      return;
    }
    req.user = toUser(payload, role);
    next();
  } catch (legacyErr) {
    console.error(
      '[requireAdmin] Legacy HS256 verification also failed:',
      legacyErr instanceof Error ? legacyErr.message : legacyErr,
    );
    res.status(401).json({ status: 401, message: 'Unauthorized' });
  }
}
