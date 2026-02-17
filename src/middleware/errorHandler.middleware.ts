import type { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { ArkErrors } from 'arktype';

import { logger } from '../logger';

export class AppError extends Error {
  readonly statusCode: number;
  readonly isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  // Safety guard (very important)
  if (res.headersSent) {
    return;
  }

  logger.error(err.message, {
    method: req.method,
    path: req.originalUrl,
    ip: req.ip,
  });

  logger.error(err);

  // ===== ArkType validation =====
  if (err instanceof ArkErrors) {
    return res.status(400).json({
      status: false,
      message: err.summary,
      data: null,
    });
  }

  /* -------------------- MONGOOSE VALIDATION -------------------- */

  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      success: false,
      message: err.message,
      data: null,
    });
  }

  // ===== Custom App Errors =====
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: false,
      message: err.message,
      data: null,
    });
  }

  // ===== Unknown / Programmer errors =====
  return res.status(500).json({
    status: false,
    message: 'Something went wrong',
    data: null,
  });
}

export function notFoundHandler(req: Request, res: Response) {
  return res.status(404).json({
    status: false,
    message: `Route ${req.originalUrl} not found`,
    data: null,
  });
}
