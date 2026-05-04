import { Response } from 'express';
import asyncHandler from 'express-async-handler';

import cloudinary from '../config/cloudinary';
import Track from '../models/Track';
import User from '../models/User';
import { createTrackSchema, signedUrlSchema, updateTrackSchema } from '../schemas/trackSchemas';
import { AuthRequest } from '../types';
import { z } from 'zod';

const objectIdRegex = /^[a-f\d]{24}$/i;

const listTracksQuerySchema = z.object({
  genre: z
    .enum(['lo-fi', 'hip-hop', 'electronic', 'jazz', 'rock', 'pop', 'classical', 'ambient', 'other'])
    .optional(),
  mood: z.enum(['chill', 'energetic', 'sad', 'happy', 'dark', 'romantic', 'other']).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  search: z.string().min(1).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const trackIdParamSchema = z.object({
  id: z.string().regex(objectIdRegex, 'Invalid track id format'),
});

const artistIdParamSchema = z.object({
  artistId: z.string().regex(objectIdRegex, 'Invalid artist id format'),
});

const signedUrlBodySchema = signedUrlSchema;

export const getAllTracks = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const parsedQuery = listTracksQuerySchema.parse(req.query);

  const filter: {
    isPublished: boolean;
    genre?: string;
    mood?: string;
    price?: { $gte?: number; $lte?: number };
    title?: { $regex: string; $options: string };
  } = {
    isPublished: true,
  };

  if (parsedQuery.genre) {
    filter.genre = parsedQuery.genre;
  }

  if (parsedQuery.mood) {
    filter.mood = parsedQuery.mood;
  }

  if (parsedQuery.minPrice !== undefined || parsedQuery.maxPrice !== undefined) {
    filter.price = {};
    if (parsedQuery.minPrice !== undefined) {
      filter.price.$gte = parsedQuery.minPrice;
    }
    if (parsedQuery.maxPrice !== undefined) {
      filter.price.$lte = parsedQuery.maxPrice;
    }
  }

  if (parsedQuery.search) {
    filter.title = { $regex: parsedQuery.search, $options: 'i' };
  }

  const skip = (parsedQuery.page - 1) * parsedQuery.limit;

  const [tracks, total] = await Promise.all([
    Track.find(filter)
      .populate('artistId', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parsedQuery.limit),
    Track.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    page: parsedQuery.page,
    limit: parsedQuery.limit,
    total,
    totalPages: Math.ceil(total / parsedQuery.limit),
    tracks,
  });
});

export const getTrackById = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = trackIdParamSchema.parse(req.params);

  const track = await Track.findById(id);

  if (!track) {
    res.status(404);
    throw new Error('Track not found');
  }

  await Track.updateOne({ _id: track._id }, { $inc: { plays: 1 } });

  const isOwner = req.user ? req.user._id === track.artistId.toString() : false;
  const hasPurchased = req.user ? req.user.purchasedTracks.includes(track._id.toString()) : false;
  const isAdmin = req.user ? req.user.role === 'admin' : false;
  const canAccessHighQuality = isOwner || hasPurchased || isAdmin;

  await track.populate('artistId', 'username avatar');

  const trackResponse = track.toObject();
  trackResponse.plays += 1;
  if (!canAccessHighQuality) {
    trackResponse.audioUrlHigh = '';
  }

  res.status(200).json({
    success: true,
    track: trackResponse,
  });
});

export const createTrack = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const parsedData = createTrackSchema.parse(req.body);

  const track = await Track.create({
    ...parsedData,
    artistId: req.user._id,
    isPublished: true,
  });

  res.status(201).json({
    success: true,
    track,
  });
});

export const updateTrack = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const { id } = trackIdParamSchema.parse(req.params);
  const parsedData = updateTrackSchema.parse(req.body);

  const track = await Track.findById(id);
  if (!track) {
    res.status(404);
    throw new Error('Track not found');
  }

  if (track.artistId.toString() !== req.user._id) {
    res.status(403);
    throw new Error('You do not own this track');
  }

  track.set(parsedData);
  const updatedTrack = await track.save();

  res.status(200).json({
    success: true,
    track: updatedTrack,
  });
});

export const deleteTrack = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const { id } = trackIdParamSchema.parse(req.params);

  const track = await Track.findById(id);
  if (!track) {
    res.status(404);
    throw new Error('Track not found');
  }

  if (track.artistId.toString() !== req.user._id) {
    res.status(403);
    throw new Error('You do not own this track');
  }

  await Track.deleteOne({ _id: track._id });

  res.status(200).json({
    success: true,
    message: 'Track deleted successfully',
  });
});

export const getSignedUploadUrl = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { resourceType } = signedUrlBodySchema.parse(req.body);
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    res.status(500);
    throw new Error('Cloudinary configuration is incomplete');
  }

  const folder = resourceType === 'image' ? 'silverride/covers' : 'silverride/tracks';
  const timestamp = Math.floor(Date.now() / 1000);

  const paramsToSign = {
    folder,
    timestamp,
  };

  const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

  res.status(200).json({
    success: true,
    signature,
    timestamp,
    api_key: apiKey,
    cloud_name: cloudName,
    folder,
    resourceType,
  });
});

export const getArtistTracks = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { artistId } = artistIdParamSchema.parse(req.params);

  const artistExists = await User.exists({ _id: artistId });
  if (!artistExists) {
    res.status(404);
    throw new Error('Artist not found');
  }

  const tracks = await Track.find({
    artistId,
    isPublished: true,
  })
    .populate('artistId', 'username avatar')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    tracks,
  });
});
