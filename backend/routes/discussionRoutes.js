const express = require('express');
const router = express.Router();
const {
  getDiscussions, getDiscussion, createDiscussion, updateDiscussion,
  deleteDiscussion, addReply, deleteReply, toggleLike, toggleReplyLike,
} = require('../controllers/discussionController');
const { protect } = require('../middleware/auth');

// Public
router.get('/', getDiscussions);
router.get('/:id', getDiscussion);

// Protected
router.post('/', protect, createDiscussion);
router.put('/:id', protect, updateDiscussion);
router.delete('/:id', protect, deleteDiscussion);
router.post('/:id/replies', protect, addReply);
router.delete('/:id/replies/:replyId', protect, deleteReply);
router.post('/:id/like', protect, toggleLike);
router.post('/:id/replies/:replyId/like', protect, toggleReplyLike);

module.exports = router;
