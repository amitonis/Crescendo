import { IUser } from '../types';

interface UserDocument {
  _id: { toString(): string };
  username: string;
  email: string;
  role: IUser['role'];
  avatar: string;
  bio: string;
  walletBalance: number;
  purchasedTracks: Array<{ toString(): string }>;
  isVerified: boolean;
  isBanned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Converts a Mongoose user document to a sanitized IUser object.
 * Removes sensitive fields like passwords and converts MongoDB ObjectIds to strings.
 */
export const sanitizeUser = (user: UserDocument): IUser => ({
  _id: user._id.toString(),
  username: user.username,
  email: user.email,
  password: '',
  role: user.role,
  avatar: user.avatar,
  bio: user.bio,
  walletBalance: user.walletBalance,
  purchasedTracks: user.purchasedTracks.map((trackId) => trackId.toString()),
  isVerified: user.isVerified,
  isBanned: user.isBanned,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});
