import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTrending, getTopRated, getRecommendations, voteForAward } from '../../services/perfumeService';
import { useAuth } from '../../contexts/AuthContext';
import PerfumeCard from '../perfumes/PerfumeCard';
import LoadingSpinner from '../common/LoadingSpinner';
import { toast } from 'react-toastify';
import { FiTrendingUp, FiStar, FiHeart, FiAward } from 'react-icons/fi';
import './Trending.css';

const TrendingPage = () => {
  const { user } = useAuth();
  const [trending, setTrending] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');

  const handleVote = async (perfumeId) => {
    if (!user) {
      toast.info('Please login to vote');
      return;
    }
    try {
      await voteForAward(perfumeId);
      toast.success('Vote submitted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to vote');
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [trendRes, topRes] = await Promise.all([
          getTrending(period),
          getTopRated(),
        ]);
        setTrending(trendRes.data.data || []);
        setTopRated(topRes.data.data || []);

        if (user) {
          try {
            const recRes = await getRecommendations();
            setRecommended(recRes.data.data || []);
          } catch { /* no recs */ }
        }
      } catch {
        toast.error('Failed to load trending data');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [period, user]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="trending-page container">
      {/* Trending Section */}
      <section className="trending-section">
        <div className="section-header">
          <h2><FiTrendingUp /> Trending Fragrances</h2>
          <div className="period-tabs">
            {['week', 'month', 'year'].map((p) => (
              <button key={p} className={`period-tab ${period === p ? 'active' : ''}`} onClick={() => setPeriod(p)}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
        {trending.length > 0 ? (
          <div className="perfume-grid">
            {trending.map((item) => {
              const perfume = item.perfumeId || item;
              return (
                <div key={perfume._id} className="trending-card-wrapper">
                  <PerfumeCard perfume={perfume} />
                  <button className="btn-vote" onClick={() => handleVote(perfume._id)} title="Vote for award">
                    <FiAward /> Vote
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="no-data">No trending data available for this period</p>
        )}
      </section>

      {/* Top Rated */}
      <section className="trending-section">
        <div className="section-header">
          <h2><FiStar /> Top Rated</h2>
          <Link to="/perfumes?sort=-averageRating" className="btn btn-secondary btn-sm">View All</Link>
        </div>
        {topRated.length > 0 ? (
          <div className="perfume-grid">
            {topRated.map((p) => <PerfumeCard key={p._id} perfume={p} />)}
          </div>
        ) : (
          <p className="no-data">No rated perfumes yet</p>
        )}
      </section>

      {/* Personalized Recommendations */}
      {user && recommended.length > 0 && (
        <section className="trending-section">
          <div className="section-header">
            <h2><FiHeart /> Recommended For You</h2>
          </div>
          <div className="perfume-grid">
            {recommended.map((p) => <PerfumeCard key={p._id} perfume={p} />)}
          </div>
        </section>
      )}
    </div>
  );
};

export default TrendingPage;
