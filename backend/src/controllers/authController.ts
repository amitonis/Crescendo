import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';

import User, { IUserDocument } from '../models/User';
import { loginSchema, registerSchema } from '../schemas/authSchemas';
import { AuthRequest } from '../types';
import { sanitizeUser } from '../utils/userSanitization';

const generateToken = (userId: string): string => {
  const jwtSecret = process.env.JWT_SECRET;
  const jwtExpiresIn = process.env.JWT_EXPIRES_IN;

  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not configured');
  }

  if (!jwtExpiresIn) {
    throw new Error('JWT_EXPIRES_IN is not configured');
  }

  return jwt.sign({ id: userId }, jwtSecret, { expiresIn: jwtExpiresIn as jwt.SignOptions['expiresIn'] });
};

const cookieOptions = {
  maxAge: 7 * 24 * 60 * 60 * 1000,
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

export const register = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const parsedData = registerSchema.parse(req.body);

  const existingUser = await User.findOne({
    $or: [{ email: parsedData.email }, { username: parsedData.username }],
  });

  if (existingUser) {
    res.status(400);
    throw new Error('User with this email or username already exists');
  }

  const user = await User.create(parsedData);
  const token = generateToken(user._id.toString());

  res.cookie('silverride_token', token, cookieOptions);

  res.status(201).json({
    success: true,
    user: sanitizeUser(user),
  });
});

export const login = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const parsedData = loginSchema.parse(req.body);

  const user = await User.findOne({ email: parsedData.email.toLowerCase() }).select('+password');

  if (!user) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const isMatch = await user.comparePassword(parsedData.password);
  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (user.isBanned) {
    res.status(403);
    throw new Error('Your account is banned');
  }

  const token = generateToken(user._id.toString());
  res.cookie('silverride_token', token, cookieOptions);

  res.status(200).json({
    success: true,
    user: sanitizeUser(user),
  });
});

export const logout = asyncHandler(async (_req: AuthRequest, res: Response): Promise<void> => {
  res.clearCookie('silverride_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

export const getMe = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized');
  }

  res.status(200).json({
    success: true,
    user: req.user,
  });
});
