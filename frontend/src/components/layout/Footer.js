import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-brand">
            <h3>🌸 PeReview</h3>
            <p>Your ultimate perfume discovery and review platform. Find your signature scent.</p>
          </div>
          <div className="footer-links">
            <h4>Explore</h4>
            <Link to="/perfumes">All Perfumes</Link>
            <Link to="/trending">Trending</Link>
            <Link to="/compare">Compare</Link>
            <Link to="/community">Community</Link>
          </div>
          <div className="footer-links">
            <h4>Categories</h4>
            <Link to="/perfumes?category=Men">Men</Link>
            <Link to="/perfumes?category=Women">Women</Link>
            <Link to="/perfumes?category=Unisex">Unisex</Link>
          </div>
          <div className="footer-links">
            <h4>Account</h4>
            <Link to="/login">Sign In</Link>
            <Link to="/register">Register</Link>
            <Link to="/profile">Profile</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} PeReview. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
