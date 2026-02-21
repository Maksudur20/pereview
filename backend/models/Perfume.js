const mongoose = require('mongoose');

const perfumeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Perfume name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    brand: {
      type: String,
      required: [true, 'Brand is required'],
      trim: true,
      maxlength: [100, 'Brand cannot exceed 100 characters'],
    },
    designer: {
      type: String,
      trim: true,
      default: '',
    },
    country: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      enum: ['Men', 'Women', 'Unisex'],
      required: [true, 'Category is required'],
    },
    releaseYear: {
      type: Number,
      min: [1900, 'Release year must be after 1900'],
      max: [new Date().getFullYear() + 1, 'Release year cannot be in the future'],
    },
    price: {
      type: Number,
      min: [0, 'Price cannot be negative'],
    },
    description: {
      type: String,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
    notes: {
      top: {
        type: [String],
        default: [],
      },
      middle: {
        type: [String],
        default: [],
      },
      base: {
        type: [String],
        default: [],
      },
    },
    imageUrl: {
      type: String,
      default: '',
    },
    buyLink: {
      type: String,
      validate: {
        validator: function (v) {
          if (!v) return true;
          return /^https?:\/\/.+/i.test(v);
        },
        message: 'Buy link must be a valid URL starting with http:// or https://',
      },
      default: '',
    },
    buyClickCount: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    averageLongevity: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    averageProjection: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    averageSillage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for optimized queries
perfumeSchema.index({ name: 'text', brand: 'text', description: 'text' });
perfumeSchema.index({ brand: 1 });
perfumeSchema.index({ category: 1 });
perfumeSchema.index({ averageRating: -1 });
perfumeSchema.index({ price: 1 });
perfumeSchema.index({ 'notes.top': 1 });
perfumeSchema.index({ 'notes.middle': 1 });
perfumeSchema.index({ 'notes.base': 1 });
perfumeSchema.index({ releaseYear: -1 });
perfumeSchema.index({ country: 1 });
perfumeSchema.index({ totalReviews: -1 });

const Perfume = mongoose.model('Perfume', perfumeSchema);
module.exports = Perfume;
