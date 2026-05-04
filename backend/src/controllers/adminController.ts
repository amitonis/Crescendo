import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import { z } from 'zod';

import Track from '../models/Track';
import Transaction from '../models/Transaction';
import User from '../models/User';
import { AuthRequest } from '../types';

const objectIdRegex = /^[a-f\d]{24}$/i;

const trackIdParamSchema = z.object({
  trackId: z.string().regex(objectIdRegex, 'Invalid track id format'),
});

const userIdParamSchema = z.object({
  userId: z.string().regex(objectIdRegex, 'Invalid user id format'),
});

const usersQuerySchema = z.object({
  role: z.enum(['admin', 'artist', 'fan']).optional(),
});

const emptyQuerySchema = z.object({}).passthrough();

export const banUser = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { userId } = userIdParamSchema.parse(req.params);

  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.isBanned = true;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'User banned successfully',
  });
});

export const unbanUser = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { userId } = userIdParamSchema.parse(req.params);

  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.isBanned = false;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'User unbanned successfully',
  });
});

export const getAllUsers = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { role } = usersQuerySchema.parse(req.query);

  const filter: { role?: 'admin' | 'artist' | 'fan' } = {};
  if (role) {
    filter.role = role;
  }

  const users = await User.find(filter).select('-password').sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    users,
  });
});

export const getStats = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  emptyQuerySchema.parse(req.query);

  const [userStatsRows, trackStatsRows, transactionStatsRows] = await Promise.all([
    User.aggregate<{
      _id: null;
      totalUsers: number;
      totalArtists: number;
      totalFans: number;
    }>([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          totalArtists: {
            $sum: {
              $cond: [{ $eq: ['$role', 'artist'] }, 1, 0],
            },
          },
          totalFans: {
            $sum: {
              $cond: [{ $eq: ['$role', 'fan'] }, 1, 0],
            },
          },
        },
      },
    ]),
    Track.aggregate<{
      _id: null;
      totalTracks: number;
    }>([
      {
        $group: {
          _id: null,
          totalTracks: { $sum: 1 },
        },
      },
    ]),
    Transaction.aggregate<{
      _id: null;
      totalTransactions: number;
      totalRevenue: number;
      totalArtistEarnings: number;
    }>([
      {
        $group: {
          _id: null,
          totalTransactions: { $sum: 1 },
          totalRevenue: { $sum: '$platformFee' },
          totalArtistEarnings: { $sum: '$artistEarnings' },
        },
      },
    ]),
  ]);

  const userStats = userStatsRows[0] ?? {
    _id: null,
    totalUsers: 0,
    totalArtists: 0,
    totalFans: 0,
  };

  const trackStats = trackStatsRows[0] ?? {
    _id: null,
    totalTracks: 0,
  };

  const transactionStats = transactionStatsRows[0] ?? {
    _id: null,
    totalTransactions: 0,
    totalRevenue: 0,
    totalArtistEarnings: 0,
  };

  res.status(200).json({
    success: true,
    stats: {
      totalUsers: userStats.totalUsers,
      totalArtists: userStats.totalArtists,
      totalFans: userStats.totalFans,
      totalTracks: trackStats.totalTracks,
      totalTransactions: transactionStats.totalTransactions,
      totalRevenue: transactionStats.totalRevenue,
      totalArtistEarnings: transactionStats.totalArtistEarnings,
    },
  });
});
