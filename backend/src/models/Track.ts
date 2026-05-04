import { Document, Model, Schema, Types, model } from 'mongoose';

import { ITrack } from '../types';

interface ITrackDocument extends Omit<ITrack, '_id' | 'artistId'>, Document {
  _id: Types.ObjectId;
  artistId: Types.ObjectId;
}

type TrackModel = Model<ITrackDocument>;

const trackSchema = new Schema<ITrackDocument, TrackModel>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    artistId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    description: {
      type: String,
      maxlength: 1000,
      default: '',
    },
    genre: {
      type: String,
      required: true,
      enum: ['lo-fi', 'hip-hop', 'electronic', 'jazz', 'rock', 'pop', 'classical', 'ambient', 'other'],
    },
    mood: {
      type: String,
      enum: ['chill', 'energetic', 'sad', 'happy', 'dark', 'romantic', 'other'],
    },
    audioUrlHigh: {
      type: String,
      required: true,
    },
    audioUrlPreview: {
      type: String,
      required: true,
    },
    coverArt: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    duration: {
      type: Number,
    },
    waveformData: [
      {
        type: Number,
      },
    ],
    plays: {
      type: Number,
      default: 0,
    },
    purchases: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    tags: {
      type: [String],
      validate: {
        validator: (value: string[]): boolean => value.length <= 10,
        message: 'Tags cannot exceed 10 items',
      },
    },
  },
  {
    timestamps: true,
  }
);

trackSchema.index({ genre: 1 });
trackSchema.index({ artistId: 1 });
trackSchema.index({ isPublished: 1 });
// Composite index for marketplace queries (published + genre filtering + sorting)
trackSchema.index({ isPublished: 1, genre: 1, createdAt: -1 });
// Index for search optimization
trackSchema.index({ title: 'text', description: 'text' });
// Index for artist tracks listing
trackSchema.index({ artistId: 1, isPublished: 1 });
// Index for price range queries
trackSchema.index({ price: 1 });


const Track = model<ITrackDocument, TrackModel>('Track', trackSchema);

export default Track;
export type { ITrackDocument };
