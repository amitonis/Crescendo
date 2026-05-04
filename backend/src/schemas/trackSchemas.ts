import { z } from 'zod';

const genres = ['lo-fi', 'hip-hop', 'electronic', 'jazz', 'rock', 'pop', 'classical', 'ambient', 'other'] as const;
const moods = ['chill', 'energetic', 'sad', 'happy', 'dark', 'romantic', 'other'] as const;

export const createTrackSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  genre: z.enum(genres),
  mood: z.enum(moods).optional(),
  audioUrlHigh: z.string().url(),
  audioUrlPreview: z.string().url(),
  coverArt: z.string().url(),
  price: z.number().min(0),
  duration: z.number().optional(),
  waveformData: z.array(z.number()).optional(),
  tags: z.array(z.string()).max(10).optional(),
});

export const updateTrackSchema = createTrackSchema.partial();

export const signedUrlSchema = z.object({
  resourceType: z.enum(['image', 'video', 'raw']),
});
