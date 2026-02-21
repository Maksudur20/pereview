import React from 'react';
import { Link } from 'react-router-dom';
import StarRating from '../common/StarRating';
import './Perfumes.css';

const PerfumeCard = ({ perfume }) => {
  return (
    <Link to={`/perfumes/${perfume._id}`} className="perfume-card card">
      <div className="perfume-card-image">
        {perfume.imageUrl ? (
          <img
            src={perfume.imageUrl}
            alt={perfume.name}
            loading="lazy"
          />
        ) : (
          <div className="perfume-card-placeholder">🌸</div>
        )}
        <span className={`category-tag badge badge-${perfume.category === 'Women' ? 'accent' : perfume.category === 'Men' ? 'primary' : 'success'}`}>
          {perfume.category}
        </span>
      </div>
      <div className="perfume-card-body">
        <p className="perfume-card-brand">{perfume.brand}</p>
        <h3 className="perfume-card-name">{perfume.name}</h3>
        <div className="perfume-card-rating">
          <StarRating rating={perfume.averageRating || 0} size={14} />
          <span className="review-count">({perfume.totalReviews || 0})</span>
        </div>
        {perfume.price > 0 && (
          <p className="perfume-card-price">${perfume.price}</p>
        )}
      </div>
    </Link>
  );
};

export default PerfumeCard;
