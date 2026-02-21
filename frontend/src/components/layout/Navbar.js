import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiSearch, FiMenu, FiX, FiUser, FiLogOut, FiSettings, FiHeart } from 'react-icons/fi';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/perfumes?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">🌸</span>
          <span className="brand-text">PeReview</span>
        </Link>

        <form className="navbar-search" onSubmit={handleSearch}>
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search perfumes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/perfumes" onClick={() => setMenuOpen(false)}>Discover</Link>
          <Link to="/trending" onClick={() => setMenuOpen(false)}>Trending</Link>
          <Link to="/compare" onClick={() => setMenuOpen(false)}>Compare</Link>
          <Link to="/community" onClick={() => setMenuOpen(false)}>Community</Link>

          {user ? (
            <div className="user-menu">
              <button className="user-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="user-avatar" />
                ) : (
                  <FiUser />
                )}
                <span className="user-name">{user.name?.split(' ')[0]}</span>
              </button>
              {dropdownOpen && (
                <div className="dropdown-menu" onClick={() => setDropdownOpen(false)}>
                  <Link to="/profile"><FiUser /> My Profile</Link>
                  <Link to="/my-reviews"><FiHeart /> My Reviews</Link>
                  {isAdmin && <Link to="/admin"><FiSettings /> Admin Dashboard</Link>}
                  <button onClick={handleLogout}><FiLogOut /> Logout</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>
              Sign In
            </Link>
          )}
        </div>

        <button className="navbar-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
