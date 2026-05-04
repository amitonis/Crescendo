import { Request } from 'express';

export interface IUser {
  _id: string;
  username: string;
  email: string;
  password: string;
  role: 'artist' | 'fan' | 'admin';
  avatar: string;
  bio: string;
  walletBalance: number;
  purchasedTracks: string[];
  isVerified: boolean;
  isBanned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITrack {
  _id: string;
  title: string;
  artistId: string;
  description: string;
  genre: 'lo-fi' | 'hip-hop' | 'electronic' | 'jazz' | 'rock' | 'pop' | 'classical' | 'ambient' | 'other';
  mood: 'chill' | 'energetic' | 'sad' | 'happy' | 'dark' | 'romantic' | 'other';
  audioUrlHigh: string;
  audioUrlPreview: string;
  coverArt: string;
  price: number;
  duration: number;
  waveformData: number[];
  plays: number;
  purchases: number;
  isPublished: boolean;
  isApproved: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ITransaction {
  _id: string;
  buyerId: string;
  sellerId: string;
  trackId: string;
  amount: number;
  platformFee: number;
  artistEarnings: number;
  status: 'success' | 'failed' | 'refunded';
  createdAt: Date;
}

export interface AuthRequest extends Request {
  user?: IUser;
}
