import { NextFunction, Response } from 'express';

import { AuthRequest } from '../types';

export const requireRole =
  (...roles: string[]) =>
  (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Not authorized' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ success: false, error: 'Forbidden: insufficient permissions' });
      return;
    }

    next();
  };
