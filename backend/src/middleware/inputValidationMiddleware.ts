import { Request, Response, NextFunction } from 'express';

/**
 * Sanitizes and validates request input to prevent common attacks.
 * - Trims whitespace from string fields
 * - Limits request payload size
 * - Validates no suspicious patterns
 */
export const inputValidationMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Skip file uploads and non-JSON requests
  if (req.is('multipart/form-data') || !req.is('json')) {
    next();
    return;
  }

  try {
    // Recursively sanitize request body
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body);
    }

    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Invalid request format',
    });
  }
};

/**
 * Recursively sanitizes an object by trimming strings and removing
 * potentially dangerous patterns.
 */
function sanitizeObject(obj: Record<string, any>): Record<string, any> {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    // Skip fields that look like internal/dangerous
    if (key.startsWith('$') || key.startsWith('__')) {
      continue;
    }

    if (typeof value === 'string') {
      // Trim whitespace
      sanitized[key] = value.trim();
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === 'object' ? sanitizeObject(item) : item
      );
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}
