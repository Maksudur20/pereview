const mongoose = require('mongoose');

const replySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Reply content is required'],
      maxlength: [500, 'Reply cannot exceed 500 characters'],
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

const discussionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Discussion title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    content: {
      type: String,
      required: [true, 'Discussion content is required'],
      maxlength: [2000, 'Content cannot exceed 2000 characters'],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    perfumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Perfume',
      default: null,
    },
    replies: [replySchema],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

discussionSchema.index({ title: 'text', content: 'text' });
discussionSchema.index({ userId: 1 });
discussionSchema.index({ perfumeId: 1 });
discussionSchema.index({ createdAt: -1 });

const Discussion = mongoose.model('Discussion', discussionSchema);
module.exports = Discussion;
