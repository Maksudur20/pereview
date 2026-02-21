const express = require('express');
const router = express.Router();
const {
  getTrending, getTopRated, getRecommendations,
  getSimilarUsersLiked, voteForAward,
} = require('../controllers/recommendationController');
const { protect, optionalAuth } = require('../middleware/auth');

// Public
router.get('/trending', getTrending);
router.get('/trending/top-rated', getTopRated);

// Protected
router.get('/recommendations', protect, getRecommendations);
router.get('/recommendations/similar-users/:perfumeId', getSimilarUsersLiked);
router.post('/trending/vote/:perfumeId', protect, voteForAward);

module.exports = router;
