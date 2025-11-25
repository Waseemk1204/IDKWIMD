import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface ReviewFormProps {
    contractId: string;
    revieweeId: string;
    revieweeName: string;
    onReviewSubmitted: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
    contractId,
    revieweeId,
    revieweeName,
    onReviewSubmitted
}) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            toast.error('Please select a rating');
            return;
        }

        if (!comment.trim()) {
            toast.error('Please write a review comment');
            return;
        }

        setLoading(true);
        try {
            await axios.post(
                '/api/v1/reviews',
                {
                    contractId,
                    reviewee: revieweeId,
                    rating,
                    comment
                },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );

            toast.success('Review submitted successfully!');
            onReviewSubmitted();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to submit review');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">
                Review {revieweeName}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rating *
                    </label>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                className="text-3xl focus:outline-none transition-colors"
                            >
                                <span className={
                                    star <= (hoverRating || rating)
                                        ? 'text-yellow-400'
                                        : 'text-gray-300'
                                }>
                                    ★
                                </span>
                            </button>
                        ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                        {rating > 0 ? `${rating} out of 5 stars` : 'Select a rating'}
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Review Comment *
                    </label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Share your experience working together..."
                        rows={4}
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {loading ? 'Submitting Review...' : 'Submit Review'}
                </button>
            </form>
        </div>
    );
};

export default ReviewForm;
