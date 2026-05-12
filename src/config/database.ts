import { PrismaClient } from '@prisma/client';

// Singleton pattern: reuse the same PrismaClient instance across the app
// to avoid exhausting the connection pool in development (hot-reload creates
// new module instances, so we attach the client to globalThis to persist it).
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

const prisma: PrismaClient =
  globalThis.__prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

export default prisma;
