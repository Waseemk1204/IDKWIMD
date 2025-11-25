import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface Review {
    _id: string;
    reviewer: {
        _id: string;
        name: string;
        profilePicture?: string;
    };
    rating: number;
    comment: string;
    createdAt: string;
}

interface UserReviewsProps {
    userId: string;
}

const UserReviews: React.FC<UserReviewsProps> = ({ userId }) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [averageRating, setAverageRating] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReviews();
    }, [userId]);

    const fetchReviews = async () => {
        try {
            const response = await axios.get(`/api/v1/reviews/user/${userId}`);

            setReviews(response.data.data.reviews || []);
            setAverageRating(response.data.data.averageRating || 0);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to fetch reviews');
        } finally {
            setLoading(false);
        }
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <span
                        key={star}
                        className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}
                    >
                        ★
                    </span>
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <p className="text-gray-500">Loading reviews...</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Reviews</h3>
                {reviews.length > 0 && (
                    <div className="flex items-center gap-2">
                        {renderStars(Math.round(averageRating))}
                        <span className="text-gray-600 font-medium">
                            {averageRating.toFixed(1)} ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                        </span>
                    </div>
                )}
            </div>

            {reviews.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                    No reviews yet
                </p>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <div
                            key={review._id}
                            className="border border-gray-200 rounded-lg p-4"
                        >
                            <div className="flex items-start gap-4 mb-3">
                                {review.reviewer.profilePicture && (
                                    <img
                                        src={review.reviewer.profilePicture}
                                        alt={review.reviewer.name}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                )}

                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold">{review.reviewer.name}</p>
                                            {renderStars(review.rating)}
                                        </div>
                                        <span className="text-sm text-gray-500">
                                            {new Date(review.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <p className="text-gray-700">{review.comment}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UserReviews;
