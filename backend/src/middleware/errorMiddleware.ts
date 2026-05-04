import { ErrorRequestHandler } from 'express';
import mongoose from 'mongoose';
import { ZodError } from 'zod';

type DuplicateKeyError = {
  code?: number;
  keyValue?: Record<string, unknown>;
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  let statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || 'Server error';

  if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((validationError) => validationError.message)
      .join(', ');
  }

  const duplicateError = err as DuplicateKeyError;
  if (duplicateError.code === 11000) {
    statusCode = 400;
    const duplicateField = duplicateError.keyValue ? Object.keys(duplicateError.keyValue)[0] : 'field';
    message = `Duplicate value for ${duplicateField}`;
  }

  if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  if (err instanceof ZodError) {
    statusCode = 400;
    message = err.errors.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join(', ');
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
};
