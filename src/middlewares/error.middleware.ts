import { ZodError } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { AppError, ConflictException, ZodValidationException } from '@/utils/error';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err } as any;

  // Prisma Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      error = new ConflictException('Duplicate field value entered', 'DUPLICATE_ENTRY');
    }
  }

  // Zod Validation Error
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      path: e.path.join('.'),
      message: e.message,
    }));
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: formattedErrors,
    });
  }

  // Operational (trusted) errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      code: err.code,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }

  // Programming or unknown errors (don't leak details in production)
  console.error('ERROR 💥:', err);

  res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong' 
      : err.message,
    code: 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};