import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

// Centralised error shape returned to consumers
export interface ApiError {
  status: number;
  message: string;
  errors?: unknown;
}

// Custom application error class so we can attach an HTTP status code
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // Zod validation errors → 422 Unprocessable Entity
  if (err instanceof ZodError) {
    res.status(422).json({
      status: 422,
      message: 'Validation failed',
      errors: err.flatten().fieldErrors,
    } satisfies ApiError);
    return;
  }

  // Our own typed application errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: err.statusCode,
      message: err.message,
    } satisfies ApiError);
    return;
  }

  // Prisma known request errors (e.g. unique constraint violation)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      res.status(409).json({
        status: 409,
        message: 'A record with that value already exists.',
      } satisfies ApiError);
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({
        status: 404,
        message: 'Record not found.',
      } satisfies ApiError);
      return;
    }
  }

  // Fallback – unexpected errors
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : (err as Error).message ?? 'Internal server error';

  console.error('[Unhandled Error]', err);

  res.status(500).json({
    status: 500,
    message,
  } satisfies ApiError);
};

export default errorHandler;
