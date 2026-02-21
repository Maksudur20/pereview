import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getMyReviews, deleteReview } from '../../services/perfumeService';
import StarRating from '../common/StarRating';
import LoadingSpinner from '../common/LoadingSpinner';
import { toast } from 'react-toastify';
import { FiTrash2, FiExternalLink } from 'react-icons/fi';
import './MyReviews.css';

const MyReviews = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchReviews();
  }, [user, navigate]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const { data } = await getMyReviews();
      setReviews(data.data || []);
    } catch {
      toast.error('Failed to load your reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await deleteReview(id);
      toast.success('Review deleted');
      fetchReviews();
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="my-reviews-page container">
      <h1>My Reviews</h1>
      <p className="my-reviews-subtitle">You've reviewed {reviews.length} perfume{reviews.length !== 1 ? 's' : ''}</p>

      {reviews.length === 0 ? (
        <div className="empty-state">
          <p>You haven't written any reviews yet. Browse perfumes and share your thoughts!</p>
          <button className="btn btn-primary" onClick={() => navigate('/perfumes')}>
            Discover Perfumes
          </button>
        </div>
      ) : (
        <div className="my-reviews-list">
          {reviews.map((review) => (
            <div key={review._id} className="my-review-card card">
              <div className="my-review-top">
                <div className="my-review-perfume" onClick={() => navigate(`/perfumes/${review.perfumeId?._id || review.perfumeId}`)}>
                  {review.perfumeId?.imageUrl && (
                    <img src={review.perfumeId.imageUrl} alt="" className="my-review-img" />
                  )}
                  <div>
                    <h3>{review.perfumeId?.name || 'Unknown Perfume'} <FiExternalLink size={14} /></h3>
                    <span className="my-review-brand">{review.perfumeId?.brand || ''}</span>
                  </div>
                </div>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(review._id)}>
                  <FiTrash2 />
                </button>
              </div>

              <div className="my-review-ratings">
                <div className="my-review-rating-main">
                  <StarRating rating={review.rating} size={16} showValue />
                </div>
                <div className="my-review-sub-ratings">
                  <span>Longevity: <strong>{review.longevity}/5</strong></span>
                  <span>Projection: <strong>{review.projection}/5</strong></span>
                  <span>Sillage: <strong>{review.sillage}/5</strong></span>
                </div>
              </div>

              {review.comment && <p className="my-review-comment">{review.comment}</p>}
              <span className="my-review-date">{new Date(review.createdAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyReviews;
