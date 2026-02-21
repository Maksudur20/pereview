import React from 'react';
import { FiStar } from 'react-icons/fi';
import { FaStar, FaStarHalfAlt } from 'react-icons/fa';

const StarRating = ({ rating, size = 16, showValue = false, interactive = false, onChange }) => {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  if (interactive) {
    return (
      <div className="stars" style={{ cursor: 'pointer' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} onClick={() => onChange && onChange(star)}>
            {star <= rating ? (
              <FaStar size={size} color="var(--star)" />
            ) : (
              <FiStar size={size} color="var(--star-empty)" />
            )}
          </span>
        ))}
        {showValue && <span style={{ marginLeft: 6, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{rating}</span>}
      </div>
    );
  }

  return (
    <div className="stars">
      {[...Array(fullStars)].map((_, i) => (
        <FaStar key={`full-${i}`} size={size} />
      ))}
      {hasHalf && <FaStarHalfAlt key="half" size={size} />}
      {[...Array(emptyStars)].map((_, i) => (
        <FiStar key={`empty-${i}`} size={size} className="empty" />
      ))}
      {showValue && <span style={{ marginLeft: 6, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{rating.toFixed(1)}</span>}
    </div>
  );
};

export default StarRating;
