export interface User {
  _id: string;
  username: string;
  email: string;
  role: 'artist' | 'fan' | 'admin';
  avatar: string;
  bio: string;
  walletBalance: number;
  purchasedTracks: string[];
  isVerified: boolean;
  isBanned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Track {
  _id: string;
  title: string;
  artistId: string | User;
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
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  _id: string;
  buyerId: string | User;
  sellerId: string | User;
  trackId: string | Track;
  amount: number;
  platformFee: number;
  artistEarnings: number;
  status: 'success' | 'failed' | 'refunded';
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}
