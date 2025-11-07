import mongoose, { Document, Schema } from 'mongoose';

export interface IMessageReaction extends Document {
  _id: string;
  message: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  reactionType: 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry' | 'thumbs_up' | 'lightbulb' | 'checkmark' | 'question';
  createdAt: Date;
}

const messageReactionSchema = new Schema<IMessageReaction>({
  message: {
    type: Schema.Types.ObjectId,
    ref: 'Message',
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reactionType: {
    type: String,
    enum: ['like', 'love', 'laugh', 'wow', 'sad', 'angry', 'thumbs_up', 'lightbulb', 'checkmark', 'question'],
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index to prevent duplicate reactions
messageReactionSchema.index({ message: 1, user: 1 }, { unique: true });
messageReactionSchema.index({ message: 1, reactionType: 1 });

export default mongoose.model<IMessageReaction>('MessageReaction', messageReactionSchema);

