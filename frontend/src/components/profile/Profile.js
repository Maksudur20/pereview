import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { updateProfile, getMyReviews, toggleFavorite } from '../../services/perfumeService';
import PerfumeCard from '../perfumes/PerfumeCard';
import StarRating from '../common/StarRating';
import LoadingSpinner from '../common/LoadingSpinner';
import { toast } from 'react-toastify';
import { FiUser, FiEdit2, FiSave, FiX, FiHeart, FiStar } from 'react-icons/fi';
import './Profile.css';

const Profile = () => {
  const { user, setUser, loadUser } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', avatar: '' });
  const [reviews, setReviews] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('reviews');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    setForm({ name: user.name || '', avatar: user.avatar || '' });

    const fetchData = async () => {
      try {
        const { data } = await getMyReviews();
        setReviews(data.data || []);
      } catch {
        // no reviews
      }
      // favorites are populated from user object
      setFavorites(user.favorites || []);
      setLoading(false);
    };
    fetchData();
  }, [user, navigate]);

  const handleSave = async () => {
    try {
      const { data } = await updateProfile({ name: form.name, avatar: form.avatar });
      setUser(data.user || data.data);
      toast.success('Profile updated!');
      setEditing(false);
      loadUser();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleRemoveFavorite = async (perfumeId) => {
    try {
      await toggleFavorite(perfumeId);
      setFavorites((prev) => prev.filter((f) => (f._id || f) !== perfumeId));
      toast.success('Removed from favorites');
      loadUser();
    } catch {
      toast.error('Failed to update favorites');
    }
  };

  if (!user) return null;

  return (
    <div className="profile-page container">
      {/* Profile Header */}
      <div className="profile-header card">
        <div className="profile-avatar-section">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="profile-avatar" />
          ) : (
            <div className="profile-avatar-placeholder">
              <FiUser size={40} />
            </div>
          )}
        </div>
        <div className="profile-info">
          {editing ? (
            <div className="profile-edit-form">
              <div className="form-group">
                <label>Name</label>
                <input
                  className="form-control"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Avatar URL</label>
                <input
                  className="form-control"
                  value={form.avatar}
                  onChange={(e) => setForm({ ...form, avatar: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="profile-edit-actions">
                <button className="btn btn-primary btn-sm" onClick={handleSave}><FiSave /> Save</button>
                <button className="btn btn-secondary btn-sm" onClick={() => setEditing(false)}><FiX /> Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <h1>{user.name}</h1>
              <p className="profile-email">{user.email}</p>
              <p className="profile-role">Role: <span className="badge">{user.role}</span></p>
              <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}>
                <FiEdit2 /> Edit Profile
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="profile-tabs">
        <button className={`tab ${tab === 'reviews' ? 'active' : ''}`} onClick={() => setTab('reviews')}>
          <FiStar /> My Reviews ({reviews.length})
        </button>
        <button className={`tab ${tab === 'favorites' ? 'active' : ''}`} onClick={() => setTab('favorites')}>
          <FiHeart /> Favorites ({favorites.length})
        </button>
      </div>

      {/* Tab Content */}
      {loading ? (
        <LoadingSpinner />
      ) : tab === 'reviews' ? (
        <div className="profile-reviews">
          {reviews.length === 0 ? (
            <div className="empty-state">
              <p>You haven't written any reviews yet.</p>
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review._id} className="profile-review-card card" onClick={() => navigate(`/perfumes/${review.perfumeId?._id || review.perfumeId}`)}>
                <div className="profile-review-header">
                  <strong>{review.perfumeId?.name || 'Perfume'}</strong>
                  <StarRating rating={review.rating} size={14} />
                </div>
                <div className="profile-review-sub">
                  <span>Longevity: {review.longevity}/5</span>
                  <span>Projection: {review.projection}/5</span>
                  <span>Sillage: {review.sillage}/5</span>
                </div>
                {review.comment && <p className="profile-review-comment">{review.comment}</p>}
                <span className="profile-review-date">{new Date(review.createdAt).toLocaleDateString()}</span>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="profile-favorites">
          {favorites.length === 0 ? (
            <div className="empty-state">
              <p>No favorites yet. Browse perfumes and add some!</p>
            </div>
          ) : (
            <div className="favorites-grid">
              {favorites.map((fav) => (
                <div key={fav._id || fav} className="favorite-item">
                  {typeof fav === 'object' ? (
                    <>
                      <PerfumeCard perfume={fav} />
                      <button className="btn btn-danger btn-sm remove-fav" onClick={(e) => { e.stopPropagation(); handleRemoveFavorite(fav._id); }}>
                        <FiX /> Remove
                      </button>
                    </>
                  ) : (
                    <p>Perfume ID: {fav}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
