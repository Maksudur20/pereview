const Review = require('../models/Review');
const Perfume = require('../models/Perfume');

// @desc    Get reviews for a perfume
// @route   GET /api/reviews/perfume/:perfumeId
const getReviewsByPerfume = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const total = await Review.countDocuments({ perfumeId: req.params.perfumeId });

    const reviews = await Review.find({ perfumeId: req.params.perfumeId })
      .populate('userId', 'name avatar')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      data: reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's review for a perfume
// @route   GET /api/reviews/my/:perfumeId
const getMyReview = async (req, res, next) => {
  try {
    const review = await Review.findOne({
      userId: req.user._id,
      perfumeId: req.params.perfumeId,
    });

    res.json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a review
// @route   POST /api/reviews
const createReview = async (req, res, next) => {
  try {
    const { perfumeId, rating, longevity, projection, sillage, comment } = req.body;

    // Check if perfume exists
    const perfume = await Perfume.findById(perfumeId);
    if (!perfume) {
      return res.status(404).json({ message: 'Perfume not found' });
    }

    // Check for existing review
    const existingReview = await Review.findOne({
      userId: req.user._id,
      perfumeId,
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this perfume' });
    }

    const review = await Review.create({
      userId: req.user._id,
      perfumeId,
      rating,
      longevity: longevity || 3,
      projection: projection || 3,
      sillage: sillage || 3,
      comment,
    });

    const populated = await review.populate('userId', 'name avatar');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
const updateReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check ownership
    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this review' });
    }

    const { rating, longevity, projection, sillage, comment } = req.body;

    if (rating) review.rating = rating;
    if (longevity) review.longevity = longevity;
    if (projection) review.projection = projection;
    if (sillage) review.sillage = sillage;
    if (comment !== undefined) review.comment = comment;

    await review.save();
    const populated = await review.populate('userId', 'name avatar');

    res.json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check ownership or admin
    if (
      review.userId.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin' &&
      req.user.role !== 'moderator'
    ) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    const perfumeId = review.perfumeId;
    await Review.findByIdAndDelete(req.params.id);

    // Recalculate ratings
    await Review.calcAverageRatings(perfumeId);

    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reviews by current user
// @route   GET /api/reviews/my
const getMyReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ userId: req.user._id })
      .populate('perfumeId', 'name brand imageUrl')
      .sort('-createdAt')
      .lean();

    res.json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReviewsByPerfume, getMyReview, createReview,
  updateReview, deleteReview, getMyReviews,
};
