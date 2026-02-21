const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    perfumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Perfume',
      required: [true, 'Perfume ID is required'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    longevity: {
      type: Number,
      min: [1, 'Longevity rating must be at least 1'],
      max: [5, 'Longevity rating cannot exceed 5'],
      default: 3,
    },
    projection: {
      type: Number,
      min: [1, 'Projection rating must be at least 1'],
      max: [5, 'Projection rating cannot exceed 5'],
      default: 3,
    },
    sillage: {
      type: Number,
      min: [1, 'Sillage rating must be at least 1'],
      max: [5, 'Sillage rating cannot exceed 5'],
      default: 3,
    },
    comment: {
      type: String,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Ensure one review per user per perfume
reviewSchema.index({ userId: 1, perfumeId: 1 }, { unique: true });
reviewSchema.index({ perfumeId: 1, createdAt: -1 });

// Static method to calculate average ratings for a perfume
reviewSchema.statics.calcAverageRatings = async function (perfumeId) {
  const stats = await this.aggregate([
    { $match: { perfumeId } },
    {
      $group: {
        _id: '$perfumeId',
        numReviews: { $sum: 1 },
        avgRating: { $avg: '$rating' },
        avgLongevity: { $avg: '$longevity' },
        avgProjection: { $avg: '$projection' },
        avgSillage: { $avg: '$sillage' },
      },
    },
  ]);

  if (stats.length > 0) {
    await mongoose.model('Perfume').findByIdAndUpdate(perfumeId, {
      totalReviews: stats[0].numReviews,
      averageRating: Math.round(stats[0].avgRating * 10) / 10,
      averageLongevity: Math.round(stats[0].avgLongevity * 10) / 10,
      averageProjection: Math.round(stats[0].avgProjection * 10) / 10,
      averageSillage: Math.round(stats[0].avgSillage * 10) / 10,
    });
  } else {
    await mongoose.model('Perfume').findByIdAndUpdate(perfumeId, {
      totalReviews: 0,
      averageRating: 0,
      averageLongevity: 0,
      averageProjection: 0,
      averageSillage: 0,
    });
  }
};

// Recalculate after save
reviewSchema.post('save', function () {
  this.constructor.calcAverageRatings(this.perfumeId);
});

// Recalculate after remove
reviewSchema.post('findOneAndDelete', function (doc) {
  if (doc) {
    doc.constructor.calcAverageRatings(doc.perfumeId);
  }
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
