import { NextFunction, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

import User from '../models/User';
import { AuthRequest, IUser } from '../types';
import { sanitizeUser } from '../utils/userSanitization';

const resolveUserFromToken = async (token: string): Promise<IUser | null> => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not configured');
  }

  const decoded = jwt.verify(token, jwtSecret) as JwtPayload | string;
  const userId = typeof decoded === 'string' ? null : decoded.id;

  if (!userId || typeof userId !== 'string') {
    return null;
  }

  const user = await User.findById(userId).select('-password');
  if (!user || user.isBanned) {
    return null;
  }

  return sanitizeUser(user);
};

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const token = req.cookies?.silverride_token;

  if (!token) {
    res.status(401).json({ success: false, error: 'Not authorized, token missing' });
    return;
  }

  try {
    const user = await resolveUserFromToken(token);
    if (!user) {
      res.status(401).json({ success: false, error: 'User not found' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof Error && error.message === 'JWT_SECRET is not configured') {
      res.status(500).json({ success: false, error: 'JWT secret is not configured' });
      return;
    }

    res.status(401).json({ success: false, error: 'Not authorized, token failed' });
  }
};

export const optionalAuth = async (req: AuthRequest, _res: Response, next: NextFunction): Promise<void> => {
  const token = req.cookies?.silverride_token;

  if (!token) {
    next();
    return;
  }

  try {
    const user = await resolveUserFromToken(token);
    if (user) {
      req.user = user;
    }
  } catch (_error) {
    // Ignore invalid/expired tokens for optional auth; continue as guest.
  }

  next();
};
