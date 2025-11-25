import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
    _id: string;
    reviewer: mongoose.Types.ObjectId;
    reviewee: mongoose.Types.ObjectId;
    job: mongoose.Types.ObjectId;
    contract: mongoose.Types.ObjectId;
    rating: number;
    comment: string;
    createdAt: Date;
    updatedAt: Date;
}

const reviewSchema = new Schema<IReview>({
    reviewer: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reviewee: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    job: {
        type: Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    contract: {
        type: Schema.Types.ObjectId,
        ref: 'Contract',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true,
        maxlength: [500, 'Review comment cannot be more than 500 characters']
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
reviewSchema.index({ contract: 1, reviewer: 1 }, { unique: true }); // One review per contract per user
reviewSchema.index({ reviewee: 1, createdAt: -1 });

export default mongoose.model<IReview>('Review', reviewSchema);
