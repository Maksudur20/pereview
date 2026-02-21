const express = require('express');
const router = express.Router();
const {
  getReviewsByPerfume, getMyReview, createReview,
  updateReview, deleteReview, getMyReviews,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

// Public
router.get('/perfume/:perfumeId', getReviewsByPerfume);

// Protected
router.get('/my', protect, getMyReviews);
router.get('/my/:perfumeId', protect, getMyReview);
router.post('/', protect, createReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
