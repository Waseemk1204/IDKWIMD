import mongoose, { Document, Schema } from 'mongoose';

export interface IConnection extends Document {
  _id: string;
  requester: mongoose.Types.ObjectId; // User who sent the request
  recipient: mongoose.Types.ObjectId; // User who received the request
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const connectionSchema = new Schema<IConnection>({
  requester: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'cancelled'],
    default: 'pending'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
connectionSchema.index({ requester: 1, recipient: 1 }, { unique: true });
connectionSchema.index({ recipient: 1, status: 1 });
connectionSchema.index({ requester: 1, status: 1 });

// Virtual for checking if connection is active
connectionSchema.virtual('isActive').get(function() {
  return this.status === 'accepted';
});

// Pre-save middleware to ensure users can't connect to themselves
connectionSchema.pre('save', function(next) {
  if (this.requester.toString() === this.recipient.toString()) {
    const error = new Error('Users cannot connect to themselves');
    return next(error);
  }
  next();
});

export const Connection = mongoose.model<IConnection>('Connection', connectionSchema);
