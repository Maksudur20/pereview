import React, { useState, useEffect } from 'react';
import { getReviewsByPerfume, getMyReview, createReview, updateReview, deleteReview } from '../../services/perfumeService';
import { useAuth } from '../../contexts/AuthContext';
import StarRating from '../common/StarRating';
import Pagination from '../common/Pagination';
import LoadingSpinner from '../common/LoadingSpinner';
import { toast } from 'react-toastify';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import './Reviews.css';

const ReviewSection = ({ perfumeId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [myReview, setMyReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(false);

  // Form state
  const [form, setForm] = useState({
    rating: 5,
    longevity: 3,
    projection: 3,
    sillage: 3,
    comment: '',
  });

  const fetchReviews = async (page = 1) => {
    try {
      const { data } = await getReviewsByPerfume(perfumeId, { page, limit: 10 });
      setReviews(data.data);
      setPagination(data.pagination);
    } catch {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyReview = async () => {
    if (!user) return;
    try {
      const { data } = await getMyReview(perfumeId);
      if (data.data) {
        setMyReview(data.data);
        setForm({
          rating: data.data.rating,
          longevity: data.data.longevity,
          projection: data.data.projection,
          sillage: data.data.sillage,
          comment: data.data.comment || '',
        });
      }
    } catch {
      // No review yet
    }
  };

  useEffect(() => {
    fetchReviews();
    fetchMyReview();
  }, [perfumeId, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing && myReview) {
        await updateReview(myReview._id, form);
        toast.success('Review updated!');
      } else {
        await createReview({ ...form, perfumeId });
        toast.success('Review submitted!');
      }
      setShowForm(false);
      setEditing(false);
      fetchReviews();
      fetchMyReview();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete your review?')) return;
    try {
      await deleteReview(myReview._id);
      setMyReview(null);
      setForm({ rating: 5, longevity: 3, projection: 3, sillage: 3, comment: '' });
      toast.success('Review deleted');
      fetchReviews();
    } catch {
      toast.error('Failed to delete review');
    }
  };

  const startEdit = () => {
    setEditing(true);
    setShowForm(true);
  };

  return (
    <div className="review-section">
      <div className="review-header">
        <h2>Reviews</h2>
        {user && !myReview && (
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
            Write a Review
          </button>
        )}
      </div>

      {/* Review Form */}
      {showForm && (
        <form className="review-form card" onSubmit={handleSubmit}>
          <h3>{editing ? 'Edit Your Review' : 'Write Your Review'}</h3>

          <div className="rating-inputs">
            <div className="rating-input-group">
              <label>Overall Rating</label>
              <StarRating rating={form.rating} interactive onChange={(val) => setForm({ ...form, rating: val })} size={24} />
            </div>
            <div className="rating-input-group">
              <label>Longevity</label>
              <StarRating rating={form.longevity} interactive onChange={(val) => setForm({ ...form, longevity: val })} size={20} />
            </div>
            <div className="rating-input-group">
              <label>Projection</label>
              <StarRating rating={form.projection} interactive onChange={(val) => setForm({ ...form, projection: val })} size={20} />
            </div>
            <div className="rating-input-group">
              <label>Sillage</label>
              <StarRating rating={form.sillage} interactive onChange={(val) => setForm({ ...form, sillage: val })} size={20} />
            </div>
          </div>

          <div className="form-group">
            <label>Your Review</label>
            <textarea
              className="form-control"
              placeholder="Share your thoughts about this fragrance..."
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
              maxLength={1000}
            />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" className="btn btn-primary">
              {editing ? 'Update Review' : 'Submit Review'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setEditing(false); }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* My Review */}
      {myReview && !showForm && (
        <div className="my-review card">
          <div className="review-card-header">
            <strong>Your Review</strong>
            <div>
              <button className="btn btn-secondary btn-sm" onClick={startEdit}><FiEdit2 /> Edit</button>
              <button className="btn btn-danger btn-sm" onClick={handleDelete} style={{ marginLeft: 8 }}><FiTrash2 /> Delete</button>
            </div>
          </div>
          <StarRating rating={myReview.rating} showValue />
          <p className="review-comment">{myReview.comment}</p>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <LoadingSpinner />
      ) : reviews.length === 0 ? (
        <div className="empty-state">
          <p>No reviews yet. Be the first to review!</p>
        </div>
      ) : (
        <>
          {reviews.map((review) => (
            <div key={review._id} className="review-card card">
              <div className="review-card-header">
                <div className="review-user">
                  {review.userId?.avatar ? (
                    <img src={review.userId.avatar} alt="" className="review-user-avatar" />
                  ) : (
                    <div className="review-user-avatar-placeholder">
                      {review.userId?.name?.[0] || '?'}
                    </div>
                  )}
                  <div>
                    <strong>{review.userId?.name || 'Anonymous'}</strong>
                    <span className="review-date">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <StarRating rating={review.rating} size={14} />
              </div>
              <div className="review-sub-ratings">
                <span>Longevity: {review.longevity}/5</span>
                <span>Projection: {review.projection}/5</span>
                <span>Sillage: {review.sillage}/5</span>
              </div>
              {review.comment && <p className="review-comment">{review.comment}</p>}
            </div>
          ))}
          <Pagination
            page={pagination.page}
            pages={pagination.pages}
            onPageChange={(p) => fetchReviews(p)}
          />
        </>
      )}
    </div>
  );
};

export default ReviewSection;
