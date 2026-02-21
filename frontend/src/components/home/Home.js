import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllPerfumes, getTrending, getTopRated } from '../../services/perfumeService';
import PerfumeCard from '../perfumes/PerfumeCard';
import LoadingSpinner from '../common/LoadingSpinner';
import { FiSearch, FiStar, FiTrendingUp, FiUsers, FiArrowRight } from 'react-icons/fi';
import './Home.css';

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [latest, setLatest] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trendRes, topRes, latestRes] = await Promise.all([
          getTrending('month').catch(() => ({ data: { data: [] } })),
          getTopRated().catch(() => ({ data: { data: [] } })),
          getAllPerfumes({ limit: 8, sort: '-createdAt' }).catch(() => ({ data: { data: [] } })),
        ]);
        setFeatured((trendRes.data.data || []).slice(0, 4).map((i) => i.perfumeId || i));
        setTopRated((topRes.data.data || []).slice(0, 4));
        setLatest((latestRes.data.data || []).slice(0, 8));
      } catch { /* handled per-request */ } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/perfumes?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero">
        <div className="hero-content container">
          <h1>Discover Your Perfect<br /><span>Fragrance</span></h1>
          <p>Explore thousands of perfumes, read authentic reviews, and find your signature scent</p>
          <form className="hero-search" onSubmit={handleSearch}>
            <FiSearch className="hero-search-icon" />
            <input
              placeholder="Search perfumes, brands, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">Search</button>
          </form>
          <div className="hero-stats">
            <div><strong>10K+</strong><span>Fragrances</span></div>
            <div><strong>50K+</strong><span>Reviews</span></div>
            <div><strong>25K+</strong><span>Community</span></div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features container">
        <div className="features-grid">
          <div className="feature-card">
            <FiSearch size={28} />
            <h3>Discover</h3>
            <p>Search by notes, brand, category or explore our curated collections</p>
          </div>
          <div className="feature-card">
            <FiStar size={28} />
            <h3>Review</h3>
            <p>Rate fragrances on longevity, projection, sillage and overall quality</p>
          </div>
          <div className="feature-card">
            <FiTrendingUp size={28} />
            <h3>Compare</h3>
            <p>Side-by-side comparison of your favorite fragrances</p>
          </div>
          <div className="feature-card">
            <FiUsers size={28} />
            <h3>Community</h3>
            <p>Join discussions and get personalized recommendations</p>
          </div>
        </div>
      </section>

      {/* Trending */}
      {featured.length > 0 && (
        <section className="home-section container">
          <div className="section-header">
            <h2><FiTrendingUp /> Trending Now</h2>
            <Link to="/trending" className="section-link">View More <FiArrowRight /></Link>
          </div>
          <div className="perfume-grid">
            {featured.map((p) => <PerfumeCard key={p._id} perfume={p} />)}
          </div>
        </section>
      )}

      {/* Top Rated */}
      {topRated.length > 0 && (
        <section className="home-section container">
          <div className="section-header">
            <h2><FiStar /> Top Rated</h2>
            <Link to="/perfumes?sort=-averageRating" className="section-link">View More <FiArrowRight /></Link>
          </div>
          <div className="perfume-grid">
            {topRated.map((p) => <PerfumeCard key={p._id} perfume={p} />)}
          </div>
        </section>
      )}

      {/* Latest */}
      {latest.length > 0 && (
        <section className="home-section container">
          <div className="section-header">
            <h2>Recently Added</h2>
            <Link to="/perfumes?sort=-createdAt" className="section-link">View All <FiArrowRight /></Link>
          </div>
          <div className="perfume-grid">
            {latest.map((p) => <PerfumeCard key={p._id} perfume={p} />)}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="cta">
        <div className="container">
          <h2>Join Our Community</h2>
          <p>Sign up to save favorites, write reviews, and get personalized recommendations</p>
          <Link to="/register" className="btn btn-primary btn-lg">Get Started</Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
