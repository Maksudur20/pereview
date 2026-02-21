import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDiscussionById, addReply, deleteDiscussion, updateDiscussion, deleteReply, toggleDiscussionLike, toggleReplyLike } from '../../services/perfumeService';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import { toast } from 'react-toastify';
import { FiHeart, FiTrash2, FiArrowLeft, FiEdit2 } from 'react-icons/fi';
import './Discussions.css';

const DiscussionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, isModerator } = useAuth();
  const [discussion, setDiscussion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', content: '' });

  const fetchDiscussion = async () => {
    try {
      const { data } = await getDiscussionById(id);
      setDiscussion(data.data);
    } catch {
      toast.error('Discussion not found');
      navigate('/community');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDiscussion(); }, [id]);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    try {
      await addReply(id, { content: replyContent });
      setReplyContent('');
      fetchDiscussion();
      toast.success('Reply added!');
    } catch {
      toast.error('Failed to add reply');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this discussion?')) return;
    try {
      await deleteDiscussion(id);
      toast.success('Deleted');
      navigate('/community');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleEdit = () => {
    setEditForm({ title: discussion.title, content: discussion.content });
    setEditing(true);
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    if (!editForm.title.trim() || !editForm.content.trim()) {
      toast.error('Title and content are required');
      return;
    }
    try {
      await updateDiscussion(id, editForm);
      toast.success('Discussion updated!');
      setEditing(false);
      fetchDiscussion();
    } catch {
      toast.error('Failed to update');
    }
  };

  const handleLike = async () => {
    if (!user) { toast.info('Please log in'); return; }
    try {
      await toggleDiscussionLike(id);
      fetchDiscussion();
    } catch {
      toast.error('Failed');
    }
  };

  const handleReplyLike = async (replyId) => {
    if (!user) { toast.info('Please log in'); return; }
    try {
      await toggleReplyLike(id, replyId);
      fetchDiscussion();
    } catch {
      toast.error('Failed');
    }
  };

  const handleDeleteReply = async (replyId) => {
    if (!window.confirm('Delete this reply?')) return;
    try {
      await deleteReply(id, replyId);
      fetchDiscussion();
      toast.success('Reply deleted');
    } catch {
      toast.error('Failed to delete reply');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!discussion) return null;

  const isOwner = user?._id === discussion.userId?._id;
  const canDelete = isOwner || isAdmin || isModerator;
  const liked = discussion.likes?.includes(user?._id);

  return (
    <div className="discussion-detail container">
      <button className="btn btn-secondary" onClick={() => navigate('/community')} style={{ marginBottom: '1rem' }}>
        <FiArrowLeft /> Back
      </button>

      <div className="discussion-detail-card card">
        <div className="discussion-detail-header">
          <div className="discussion-user">
            {discussion.userId?.avatar ? (
              <img src={discussion.userId.avatar} alt="" className="discussion-avatar" />
            ) : (
              <div className="discussion-avatar-placeholder">{discussion.userId?.name?.[0] || '?'}</div>
            )}
            <div>
              <strong>{discussion.userId?.name || 'Anonymous'}</strong>
              <span className="discussion-date">{new Date(discussion.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          {canDelete && (
            <div style={{ display: 'flex', gap: 8 }}>
              {isOwner && <button className="btn btn-secondary btn-sm" onClick={handleEdit}><FiEdit2 /> Edit</button>}
              <button className="btn btn-danger btn-sm" onClick={handleDelete}><FiTrash2 /> Delete</button>
            </div>
          )}
        </div>

        {editing ? (
          <form className="discussion-edit-form" onSubmit={handleEditSave}>
            <div className="form-group">
              <label>Title</label>
              <input className="form-control" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Content</label>
              <textarea className="form-control" rows={5} value={editForm.content} onChange={(e) => setEditForm({ ...editForm, content: e.target.value })} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" className="btn btn-primary btn-sm">Save</button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </form>
        ) : (
          <>
            <h1 className="discussion-detail-title">{discussion.title}</h1>
            <div className="discussion-detail-content">{discussion.content}</div>
          </>
        )}

        {discussion.tags?.length > 0 && (
          <div className="discussion-tags">
            {discussion.tags.map((t) => <span key={t} className="tag">{t}</span>)}
          </div>
        )}

        <div className="discussion-actions">
          <button className={`like-btn ${liked ? 'liked' : ''}`} onClick={handleLike}>
            <FiHeart /> {discussion.likes?.length || 0}
          </button>
        </div>
      </div>

      {/* Replies */}
      <div className="replies-section">
        <h2>{discussion.replies?.length || 0} Replies</h2>

        {user && (
          <form className="reply-form" onSubmit={handleReply}>
            <textarea
              className="form-control"
              placeholder="Write a reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              rows={3}
            />
            <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }}>Reply</button>
          </form>
        )}

        {discussion.replies?.map((reply) => {
          const replyLiked = reply.likes?.includes(user?._id);
          const canDeleteReply = user?._id === reply.userId?._id || isAdmin || isModerator;
          return (
            <div key={reply._id} className="reply-card card">
              <div className="reply-header">
                <div className="discussion-user">
                  {reply.userId?.avatar ? (
                    <img src={reply.userId.avatar} alt="" className="discussion-avatar small" />
                  ) : (
                    <div className="discussion-avatar-placeholder small">{reply.userId?.name?.[0] || '?'}</div>
                  )}
                  <div>
                    <strong>{reply.userId?.name || 'Anonymous'}</strong>
                    <span className="discussion-date">{new Date(reply.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="reply-actions">
                  <button className={`like-btn small ${replyLiked ? 'liked' : ''}`} onClick={() => handleReplyLike(reply._id)}>
                    <FiHeart /> {reply.likes?.length || 0}
                  </button>
                  {canDeleteReply && (
                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteReply(reply._id)}>
                      <FiTrash2 />
                    </button>
                  )}
                </div>
              </div>
              <p className="reply-content">{reply.content}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DiscussionDetail;
