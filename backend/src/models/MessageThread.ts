import mongoose, { Document, Schema } from 'mongoose';

export interface IMessageThread extends Document {
  _id: string;
  conversation: mongoose.Types.ObjectId;
  parentMessage: mongoose.Types.ObjectId;
  messages: mongoose.Types.ObjectId[];
  title?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const messageThreadSchema = new Schema<IMessageThread>({
  conversation: {
    type: Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  parentMessage: {
    type: Schema.Types.ObjectId,
    ref: 'Message',
    required: true
  },
  messages: [{
    type: Schema.Types.ObjectId,
    ref: 'Message'
  }],
  title: {
    type: String,
    maxlength: [100, 'Thread title cannot be more than 100 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
messageThreadSchema.index({ conversation: 1, isActive: 1 });
messageThreadSchema.index({ parentMessage: 1 });

export default mongoose.model<IMessageThread>('MessageThread', messageThreadSchema);

