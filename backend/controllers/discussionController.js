const Discussion = require('../models/Discussion');

// @desc    Get all discussions with pagination
// @route   GET /api/discussions
const getDiscussions = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sort = '-createdAt', search, perfumeId } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {};
    if (search) query.$text = { $search: search };
    if (perfumeId) query.perfumeId = perfumeId;

    const total = await Discussion.countDocuments(query);

    const discussions = await Discussion.find(query)
      .populate('userId', 'name avatar')
      .populate('perfumeId', 'name brand')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Add reply count and like count
    const data = discussions.map((d) => ({
      ...d,
      replyCount: d.replies ? d.replies.length : 0,
      likeCount: d.likes ? d.likes.length : 0,
    }));

    res.json({
      success: true,
      data,
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

// @desc    Get single discussion
// @route   GET /api/discussions/:id
const getDiscussion = async (req, res, next) => {
  try {
    const discussion = await Discussion.findById(req.params.id)
      .populate('userId', 'name avatar')
      .populate('perfumeId', 'name brand imageUrl')
      .populate('replies.userId', 'name avatar');

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    res.json({ success: true, data: discussion });
  } catch (error) {
    next(error);
  }
};

// @desc    Create discussion
// @route   POST /api/discussions
const createDiscussion = async (req, res, next) => {
  try {
    const { title, content, perfumeId, tags } = req.body;

    const discussion = await Discussion.create({
      title,
      content,
      userId: req.user._id,
      perfumeId: perfumeId || null,
      tags: tags || [],
    });

    const populated = await discussion.populate('userId', 'name avatar');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Update discussion
// @route   PUT /api/discussions/:id
const updateDiscussion = async (req, res, next) => {
  try {
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    if (discussion.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { title, content, tags } = req.body;
    if (title) discussion.title = title;
    if (content) discussion.content = content;
    if (tags) discussion.tags = tags;

    await discussion.save();
    res.json({ success: true, data: discussion });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete discussion
// @route   DELETE /api/discussions/:id
const deleteDiscussion = async (req, res, next) => {
  try {
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    if (
      discussion.userId.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin' &&
      req.user.role !== 'moderator'
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Discussion.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Discussion deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Add reply to discussion
// @route   POST /api/discussions/:id/replies
const addReply = async (req, res, next) => {
  try {
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    discussion.replies.push({
      userId: req.user._id,
      content: req.body.content,
    });

    await discussion.save();

    const populated = await discussion.populate('replies.userId', 'name avatar');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete reply
// @route   DELETE /api/discussions/:id/replies/:replyId
const deleteReply = async (req, res, next) => {
  try {
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    const reply = discussion.replies.id(req.params.replyId);
    if (!reply) {
      return res.status(404).json({ message: 'Reply not found' });
    }

    if (
      reply.userId.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin' &&
      req.user.role !== 'moderator'
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    discussion.replies.pull({ _id: req.params.replyId });
    await discussion.save();

    res.json({ success: true, message: 'Reply deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle like on discussion
// @route   POST /api/discussions/:id/like
const toggleLike = async (req, res, next) => {
  try {
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    const index = discussion.likes.indexOf(req.user._id);
    if (index > -1) {
      discussion.likes.splice(index, 1);
    } else {
      discussion.likes.push(req.user._id);
    }

    await discussion.save();
    res.json({ success: true, likeCount: discussion.likes.length, liked: index === -1 });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle like on reply
// @route   POST /api/discussions/:id/replies/:replyId/like
const toggleReplyLike = async (req, res, next) => {
  try {
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    const reply = discussion.replies.id(req.params.replyId);
    if (!reply) {
      return res.status(404).json({ message: 'Reply not found' });
    }

    const index = reply.likes.indexOf(req.user._id);
    if (index > -1) {
      reply.likes.splice(index, 1);
    } else {
      reply.likes.push(req.user._id);
    }

    await discussion.save();
    res.json({ success: true, likeCount: reply.likes.length, liked: index === -1 });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDiscussions, getDiscussion, createDiscussion, updateDiscussion,
  deleteDiscussion, addReply, deleteReply, toggleLike, toggleReplyLike,
};
