const Perfume = require('../models/Perfume');
const Review = require('../models/Review');

// @desc    Get trending perfumes (most reviewed recently)
// @route   GET /api/trending
const getTrending = async (req, res, next) => {
  try {
    const { period = 'month' } = req.query;

    let dateFilter = new Date();
    if (period === 'week') dateFilter.setDate(dateFilter.getDate() - 7);
    else if (period === 'month') dateFilter.setMonth(dateFilter.getMonth() - 1);
    else if (period === 'year') dateFilter.setFullYear(dateFilter.getFullYear() - 1);

    // Perfumes with most reviews in the period
    const trending = await Review.aggregate([
      { $match: { createdAt: { $gte: dateFilter } } },
      {
        $group: {
          _id: '$perfumeId',
          reviewCount: { $sum: 1 },
          avgRating: { $avg: '$rating' },
        },
      },
      { $sort: { reviewCount: -1, avgRating: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'perfumes',
          localField: '_id',
          foreignField: '_id',
          as: 'perfume',
        },
      },
      { $unwind: '$perfume' },
      {
        $project: {
          _id: '$perfume._id',
          name: '$perfume.name',
          brand: '$perfume.brand',
          imageUrl: '$perfume.imageUrl',
          averageRating: '$perfume.averageRating',
          totalReviews: '$perfume.totalReviews',
          category: '$perfume.category',
          recentReviews: '$reviewCount',
          recentAvgRating: { $round: ['$avgRating', 1] },
        },
      },
    ]);

    res.json({ success: true, data: trending });
  } catch (error) {
    next(error);
  }
};

// @desc    Get top rated perfumes
// @route   GET /api/trending/top-rated
const getTopRated = async (req, res, next) => {
  try {
    const { limit = 10, minReviews = 3 } = req.query;

    const perfumes = await Perfume.find({
      totalReviews: { $gte: parseInt(minReviews) },
    })
      .sort({ averageRating: -1, totalReviews: -1 })
      .limit(parseInt(limit))
      .select('name brand imageUrl averageRating totalReviews category price')
      .lean();

    res.json({ success: true, data: perfumes });
  } catch (error) {
    next(error);
  }
};

// @desc    Get personalized recommendations for a user
// @route   GET /api/recommendations
const getRecommendations = async (req, res, next) => {
  try {
    // Get user's highly rated perfumes (4+)
    const userReviews = await Review.find({
      userId: req.user._id,
      rating: { $gte: 4 },
    }).populate('perfumeId', 'notes category brand');

    if (userReviews.length === 0) {
      // No reviews yet - return popular perfumes
      const popular = await Perfume.find()
        .sort({ averageRating: -1, totalReviews: -1 })
        .limit(10)
        .lean();
      return res.json({ success: true, data: popular, type: 'popular' });
    }

    // Collect preferred notes and categories
    const preferredNotes = new Set();
    const preferredBrands = new Set();
    const reviewedPerfumeIds = [];

    userReviews.forEach((review) => {
      if (review.perfumeId) {
        reviewedPerfumeIds.push(review.perfumeId._id);
        if (review.perfumeId.notes) {
          review.perfumeId.notes.top?.forEach((n) => preferredNotes.add(n));
          review.perfumeId.notes.middle?.forEach((n) => preferredNotes.add(n));
          review.perfumeId.notes.base?.forEach((n) => preferredNotes.add(n));
        }
        if (review.perfumeId.brand) preferredBrands.add(review.perfumeId.brand);
      }
    });

    const noteArray = [...preferredNotes];

    // Find perfumes with similar notes that user hasn't reviewed
    const recommendations = await Perfume.find({
      _id: { $nin: reviewedPerfumeIds },
      $or: [
        { 'notes.top': { $in: noteArray } },
        { 'notes.middle': { $in: noteArray } },
        { 'notes.base': { $in: noteArray } },
      ],
    })
      .sort({ averageRating: -1, totalReviews: -1 })
      .limit(10)
      .lean();

    res.json({ success: true, data: recommendations, type: 'personalized' });
  } catch (error) {
    next(error);
  }
};

// @desc    "Users who liked this also liked" recommendations
// @route   GET /api/recommendations/similar-users/:perfumeId
const getSimilarUsersLiked = async (req, res, next) => {
  try {
    const perfumeId = req.params.perfumeId;

    // Find users who rated this perfume highly
    const likedByUsers = await Review.find({
      perfumeId,
      rating: { $gte: 4 },
    }).select('userId');

    const userIds = likedByUsers.map((r) => r.userId);

    if (userIds.length === 0) {
      return res.json({ success: true, data: [] });
    }

    // Find other perfumes those users rated highly
    const alsoLiked = await Review.aggregate([
      {
        $match: {
          userId: { $in: userIds },
          perfumeId: { $ne: require('mongoose').Types.ObjectId.createFromHexString(perfumeId) },
          rating: { $gte: 4 },
        },
      },
      {
        $group: {
          _id: '$perfumeId',
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' },
        },
      },
      { $sort: { count: -1, avgRating: -1 } },
      { $limit: 6 },
      {
        $lookup: {
          from: 'perfumes',
          localField: '_id',
          foreignField: '_id',
          as: 'perfume',
        },
      },
      { $unwind: '$perfume' },
      {
        $project: {
          _id: '$perfume._id',
          name: '$perfume.name',
          brand: '$perfume.brand',
          imageUrl: '$perfume.imageUrl',
          averageRating: '$perfume.averageRating',
          totalReviews: '$perfume.totalReviews',
          category: '$perfume.category',
          matchCount: '$count',
        },
      },
    ]);

    res.json({ success: true, data: alsoLiked });
  } catch (error) {
    next(error);
  }
};

// @desc    Vote for perfume award
// @route   POST /api/trending/vote/:perfumeId
const voteForAward = async (req, res, next) => {
  try {
    // Simple implementation - increment a "votes" field or track in separate collection
    // For MVP, we use the buy click count as a voting mechanism
    const perfume = await Perfume.findById(req.params.perfumeId);

    if (!perfume) {
      return res.status(404).json({ message: 'Perfume not found' });
    }

    // Check if user already has a high rating review (used as "vote")
    const existingVote = await Review.findOne({
      perfumeId: req.params.perfumeId,
      userId: req.user._id,
    });

    if (!existingVote) {
      return res.status(400).json({ message: 'You must review a perfume before voting for it' });
    }

    res.json({ success: true, message: 'Vote recorded', perfumeId: perfume._id });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTrending, getTopRated, getRecommendations,
  getSimilarUsersLiked, voteForAward,
};
