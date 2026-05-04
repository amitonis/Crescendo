import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import { z } from 'zod';

import Track from '../models/Track';
import Transaction from '../models/Transaction';
import User from '../models/User';
import { purchaseSchema } from '../schemas/transactionSchemas';
import { AuthRequest } from '../types';

const emptyQuerySchema = z.object({}).passthrough();

export const purchaseTrack = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const { trackId } = purchaseSchema.parse(req.body);

  const track = await Track.findOne({
    _id: trackId,
    isPublished: true,
    isApproved: true,
  });

  if (!track) {
    res.status(404);
    throw new Error('Track not found or unavailable for purchase');
  }

  if (req.user.purchasedTracks.includes(trackId)) {
    res.status(409);
    throw new Error('Track already purchased');
  }

  if (track.artistId.toString() === req.user._id) {
    res.status(400);
    throw new Error('Artists cannot purchase their own tracks');
  }

  const amount = track.price;
  const platformFee = Number((amount * 0.1).toFixed(2));
  const artistEarnings = Number((amount * 0.9).toFixed(2));

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const createdTransactions = await Transaction.create(
      [
        {
          buyerId: req.user._id,
          sellerId: track.artistId,
          trackId: track._id,
          amount,
          platformFee,
          artistEarnings,
          status: 'success',
        },
      ],
      { session }
    );

    const createdTransaction = createdTransactions[0];

    const buyerUpdateResult = await User.updateOne(
      { _id: req.user._id },
      { $addToSet: { purchasedTracks: track._id } },
      { session }
    );

    if (buyerUpdateResult.modifiedCount === 0) {
      res.status(409);
      throw new Error('Track already purchased');
    }

    const artistUpdateResult = await User.updateOne(
      { _id: track.artistId },
      { $inc: { walletBalance: artistEarnings } },
      { session }
    );

    if (artistUpdateResult.modifiedCount === 0) {
      res.status(500);
      throw new Error('Failed to update artist balance');
    }

    const trackUpdateResult = await Track.updateOne({ _id: track._id }, { $inc: { purchases: 1 } }, { session });

    if (trackUpdateResult.modifiedCount === 0) {
      res.status(500);
      throw new Error('Failed to update track purchase count');
    }

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      transaction: createdTransaction,
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
});

export const getMyPurchases = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized');
  }

  emptyQuerySchema.parse(req.query);

  const transactions = await Transaction.find({
    buyerId: req.user._id,
    status: 'success',
  })
    .populate({
      path: 'trackId',
      populate: {
        path: 'artistId',
        select: 'username avatar',
      },
    })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    purchases: transactions,
  });
});

export const getMyEarnings = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized');
  }

  emptyQuerySchema.parse(req.query);

  const transactions = await Transaction.find({ sellerId: req.user._id })
    .populate('trackId')
    .populate('buyerId', 'username email avatar')
    .sort({ createdAt: -1 });

  const aggregateRows = await Transaction.aggregate<{
    _id: null;
    totalEarnings: number;
    totalSales: number;
    totalPlatformFees: number;
  }>([
    {
      $match: {
        sellerId: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $group: {
        _id: null,
        totalEarnings: { $sum: '$artistEarnings' },
        totalSales: { $sum: 1 },
        totalPlatformFees: { $sum: '$platformFee' },
      },
    },
  ]);

  const aggregate = aggregateRows[0] ?? {
    _id: null,
    totalEarnings: 0,
    totalSales: 0,
    totalPlatformFees: 0,
  };

  res.status(200).json({
    success: true,
    transactions,
    stats: {
      totalEarnings: aggregate.totalEarnings,
      totalSales: aggregate.totalSales,
      totalPlatformFees: aggregate.totalPlatformFees,
    },
  });
});
