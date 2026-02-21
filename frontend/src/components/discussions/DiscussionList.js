import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDiscussions, createDiscussion } from '../../services/perfumeService';
import { useAuth } from '../../contexts/AuthContext';
import Pagination from '../common/Pagination';
import LoadingSpinner from '../common/LoadingSpinner';
import { toast } from 'react-toastify';
import { FiMessageCircle, FiHeart, FiPlus, FiX } from 'react-icons/fi';
import './Discussions.css';

const DiscussionList = () => {
  const { user } = useAuth();
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', tags: '' });

  const fetchDiscussions = async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await getDiscussions({ page, limit: 12 });
      setDiscussions(data.data);
      setPagination(data.pagination);
    } catch {
      toast.error('Failed to load discussions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDiscussions(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      toast.error('Title and content are required');
      return;
    }
    try {
      const payload = {
        title: form.title,
        content: form.content,
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      };
      await createDiscussion(payload);
      toast.success('Discussion created!');
      setShowForm(false);
      setForm({ title: '', content: '', tags: '' });
      fetchDiscussions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create discussion');
    }
  };

  return (
    <div className="discussions-page container">
      <div className="discussions-header">
        <div>
          <h1>Community Discussions</h1>
          <p>Share your fragrance experiences and connect with others</p>
        </div>
        {user && (
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? <><FiX /> Cancel</> : <><FiPlus /> New Discussion</>}
          </button>
        )}
      </div>

      {showForm && (
        <form className="discussion-form card" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input
              className="form-control"
              placeholder="Discussion title..."
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              maxLength={200}
            />
          </div>
          <div className="form-group">
            <label>Content</label>
            <textarea
              className="form-control"
              placeholder="What's on your mind?"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={5}
            />
          </div>
          <div className="form-group">
            <label>Tags (comma-separated)</label>
            <input
              className="form-control"
              placeholder="e.g. niche, summer, collection"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
            />
          </div>
          <button type="submit" className="btn btn-primary">Post Discussion</button>
        </form>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : discussions.length === 0 ? (
        <div className="empty-state">
          <FiMessageCircle size={48} />
          <p>No discussions yet. Start a conversation!</p>
        </div>
      ) : (
        <>
          <div className="discussions-list">
            {discussions.map((d) => (
              <Link to={`/discussions/${d._id}`} className="discussion-card card" key={d._id}>
                <div className="discussion-card-top">
                  <div className="discussion-user">
                    {d.userId?.avatar ? (
                      <img src={d.userId.avatar} alt="" className="discussion-avatar" />
                    ) : (
                      <div className="discussion-avatar-placeholder">{d.userId?.name?.[0] || '?'}</div>
                    )}
                    <div>
                      <strong>{d.userId?.name || 'Anonymous'}</strong>
                      <span className="discussion-date">{new Date(d.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <h3 className="discussion-title">{d.title}</h3>
                <p className="discussion-excerpt">{d.content.slice(0, 150)}{d.content.length > 150 ? '...' : ''}</p>
                <div className="discussion-meta">
                  <span><FiMessageCircle /> {d.replies?.length || 0} replies</span>
                  <span><FiHeart /> {d.likes?.length || 0} likes</span>
                  {d.tags?.length > 0 && (
                    <div className="discussion-tags">
                      {d.tags.slice(0, 3).map((t) => <span key={t} className="tag">{t}</span>)}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
          <Pagination page={pagination.page} pages={pagination.pages} onPageChange={fetchDiscussions} />
        </>
      )}
    </div>
  );
};

export default DiscussionList;
