import React from 'react';

const LoadingSpinner = ({ text = 'Loading...' }) => (
  <div className="loading-spinner">
    <div style={{ textAlign: 'center' }}>
      <div className="spinner"></div>
      <p style={{ marginTop: 12, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{text}</p>
    </div>
  </div>
);

export default LoadingSpinner;
