import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPerfumeById, getSimilarPerfumes, trackBuyClick, getSimilarUsersLiked, toggleFavorite } from '../../services/perfumeService';
import { useAuth } from '../../contexts/AuthContext';
import StarRating from '../common/StarRating';
import LoadingSpinner from '../common/LoadingSpinner';
import PerfumeCard from './PerfumeCard';
import ReviewSection from '../reviews/ReviewSection';
import { toast } from 'react-toastify';
import { FiShoppingCart, FiMapPin, FiCalendar, FiTag, FiHeart } from 'react-icons/fi';
import './Perfumes.css';

const PerfumeDetail = () => {
  const { id } = useParams();
  const { user, loadUser } = useAuth();
  const [perfume, setPerfume] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [alsoLiked, setAlsoLiked] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    if (user?.favorites) {
      setIsFav(user.favorites.some((f) => (f._id || f) === id));
    }
  }, [user, id]);

  const handleToggleFavorite = async () => {
    if (!user) { toast.info('Please log in to save favorites'); return; }
    try {
      await toggleFavorite(id);
      setIsFav(!isFav);
      toast.success(isFav ? 'Removed from favorites' : 'Added to favorites!');
      loadUser();
    } catch {
      toast.error('Failed to update favorites');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data } = await getPerfumeById(id);
        setPerfume(data.data);

        // Fetch similar and also-liked in parallel
        const [similarRes, alsoLikedRes] = await Promise.all([
          getSimilarPerfumes(id).catch(() => ({ data: { data: [] } })),
          getSimilarUsersLiked(id).catch(() => ({ data: { data: [] } })),
        ]);
        setSimilar(similarRes.data.data);
        setAlsoLiked(alsoLikedRes.data.data);
      } catch {
        toast.error('Failed to load perfume details');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleBuyClick = async () => {
    if (!perfume.buyLink) return;
    try {
      await trackBuyClick(id);
    } catch {
      // Non-critical
    }
    window.open(perfume.buyLink, '_blank', 'noopener,noreferrer');
  };

  if (loading) return <LoadingSpinner />;
  if (!perfume) return <div className="empty-state"><h3>Perfume not found</h3></div>;

  return (
    <div className="perfume-detail container">
      <div className="perfume-detail-grid">
        <div className="perfume-detail-image card">
          {perfume.imageUrl ? (
            <img src={perfume.imageUrl} alt={perfume.name} />
          ) : (
            <div className="perfume-detail-image-placeholder">🌸</div>
          )}
        </div>

        <div className="perfume-detail-info">
          <span className={`badge badge-${perfume.category === 'Women' ? 'accent' : perfume.category === 'Men' ? 'primary' : 'success'}`}>
            {perfume.category}
          </span>
          <h1>{perfume.name}</h1>
          <p className="perfume-detail-brand">by {perfume.brand}</p>

          <div className="perfume-detail-meta">
            {perfume.designer && (
              <span className="meta-item"><FiTag /> {perfume.designer}</span>
            )}
            {perfume.country && (
              <span className="meta-item"><FiMapPin /> {perfume.country}</span>
            )}
            {perfume.releaseYear && (
              <span className="meta-item"><FiCalendar /> {perfume.releaseYear}</span>
            )}
          </div>

          <div className="perfume-detail-rating">
            <span className="rating-value">{(perfume.averageRating || 0).toFixed(1)}</span>
            <div className="rating-details">
              <StarRating rating={perfume.averageRating || 0} size={18} />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {perfume.totalReviews || 0} reviews
              </span>
            </div>
          </div>

          <div className="sub-ratings">
            <div className="sub-rating-item">
              <div className="sub-rating-label">Longevity</div>
              <div className="sub-rating-value">{(perfume.averageLongevity || 0).toFixed(1)}</div>
              <div className="sub-rating-bar">
                <div className="sub-rating-fill" style={{ width: `${((perfume.averageLongevity || 0) / 5) * 100}%` }}></div>
              </div>
            </div>
            <div className="sub-rating-item">
              <div className="sub-rating-label">Projection</div>
              <div className="sub-rating-value">{(perfume.averageProjection || 0).toFixed(1)}</div>
              <div className="sub-rating-bar">
                <div className="sub-rating-fill" style={{ width: `${((perfume.averageProjection || 0) / 5) * 100}%` }}></div>
              </div>
            </div>
            <div className="sub-rating-item">
              <div className="sub-rating-label">Sillage</div>
              <div className="sub-rating-value">{(perfume.averageSillage || 0).toFixed(1)}</div>
              <div className="sub-rating-bar">
                <div className="sub-rating-fill" style={{ width: `${((perfume.averageSillage || 0) / 5) * 100}%` }}></div>
              </div>
            </div>
          </div>

          <p className="perfume-detail-description">{perfume.description}</p>

          {/* Notes Pyramid */}
          <div className="notes-pyramid">
            <h3>Fragrance Notes</h3>
            {perfume.notes?.top?.length > 0 && (
              <div className="note-layer">
                <div className="note-layer-label">Top Notes</div>
                <div className="note-tags">
                  {perfume.notes.top.map((n) => (
                    <span key={n} className="note-tag top">{n}</span>
                  ))}
                </div>
              </div>
            )}
            {perfume.notes?.middle?.length > 0 && (
              <div className="note-layer">
                <div className="note-layer-label">Heart Notes</div>
                <div className="note-tags">
                  {perfume.notes.middle.map((n) => (
                    <span key={n} className="note-tag middle">{n}</span>
                  ))}
                </div>
              </div>
            )}
            {perfume.notes?.base?.length > 0 && (
              <div className="note-layer">
                <div className="note-layer-label">Base Notes</div>
                <div className="note-tags">
                  {perfume.notes.base.map((n) => (
                    <span key={n} className="note-tag base">{n}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="buy-section">
            {perfume.price > 0 && (
              <span className="detail-price">${perfume.price}</span>
            )}
            {perfume.buyLink && (
              <button className="btn btn-accent buy-btn" onClick={handleBuyClick}>
                <FiShoppingCart /> Buy Now
              </button>
            )}
            <button className={`btn btn-fav ${isFav ? 'active' : ''}`} onClick={handleToggleFavorite}>
              <FiHeart /> {isFav ? 'Saved' : 'Save to Favorites'}
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <ReviewSection perfumeId={id} />

      {/* Users who liked this also liked */}
      {alsoLiked.length > 0 && (
        <div className="similar-section">
          <h2>Users Who Liked This Also Liked</h2>
          <div className="similar-grid">
            {alsoLiked.map((p) => (
              <PerfumeCard key={p._id} perfume={p} />
            ))}
          </div>
        </div>
      )}

      {/* Similar Perfumes */}
      {similar.length > 0 && (
        <div className="similar-section">
          <h2>Similar Perfumes</h2>
          <div className="similar-grid">
            {similar.map((p) => (
              <PerfumeCard key={p._id} perfume={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PerfumeDetail;
