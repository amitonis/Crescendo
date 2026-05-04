import bcrypt from 'bcryptjs';
import { Document, Model, Schema, Types, model } from 'mongoose';

import { IUser } from '../types';

interface IUserDocument extends Omit<IUser, '_id' | 'purchasedTracks'>, Document {
  _id: Types.ObjectId;
  purchasedTracks: Types.ObjectId[];
  comparePassword(candidatePassword: string): Promise<boolean>;
}

type UserModel = Model<IUserDocument>;

const userSchema = new Schema<IUserDocument, UserModel>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: ['artist', 'fan', 'admin'],
      default: 'fan',
    },
    avatar: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      maxlength: 500,
      default: '',
    },
    walletBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    purchasedTracks: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Track',
      },
    ],
    isVerified: {
      type: Boolean,
      default: false,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  return next();
});

userSchema.methods.comparePassword = async function comparePassword(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Add indexes for common queries
// Note: email and username already have indexes via "unique: true" property
userSchema.index({ role: 1 });
userSchema.index({ isBanned: 1 });


const User = model<IUserDocument, UserModel>('User', userSchema);

export default User;
export type { IUserDocument };
