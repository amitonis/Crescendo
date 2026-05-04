import { Document, Model, Schema, Types, model } from 'mongoose';

import { ITransaction } from '../types';

interface ITransactionDocument extends Omit<ITransaction, '_id' | 'buyerId' | 'sellerId' | 'trackId'>, Document {
  _id: Types.ObjectId;
  buyerId: Types.ObjectId;
  sellerId: Types.ObjectId;
  trackId: Types.ObjectId;
}

type TransactionModel = Model<ITransactionDocument>;

const transactionSchema = new Schema<ITransactionDocument, TransactionModel>(
  {
    buyerId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    trackId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Track',
    },
    amount: {
      type: Number,
      required: true,
    },
    platformFee: {
      type: Number,
      required: true,
    },
    artistEarnings: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['success', 'failed', 'refunded'],
      default: 'success',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

transactionSchema.index({ buyerId: 1 });
transactionSchema.index({ sellerId: 1 });
// Composite index for finding buyer purchases (most common query)
transactionSchema.index({ buyerId: 1, createdAt: -1 });
// Composite index for seller earnings
transactionSchema.index({ sellerId: 1, createdAt: -1 });
// Index for transaction status queries
transactionSchema.index({ status: 1 });
// Composite index for finding transactions by track
transactionSchema.index({ trackId: 1, createdAt: -1 });


const Transaction = model<ITransactionDocument, TransactionModel>('Transaction', transactionSchema);

export default Transaction;
export type { ITransactionDocument };
