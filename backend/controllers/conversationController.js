const Conversation = require('../models/Conversation');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

/**
 * @desc    Create a new conversation
 * @route   POST /api/conversations
 * @access  Private
 */
exports.createConversation = catchAsync(async (req, res, next) => {
  const { title } = req.body;

  const conversation = await Conversation.create({
    user: req.user.id,
    title: title || 'New Conversation',
    messages: []
  });

  res.status(201).json({
    status: 'success',
    data: {
      conversation
    }
  });
});

/**
 * @desc    Get all conversations for the logged-in user
 * @route   GET /api/conversations
 * @access  Private
 */
exports.getUserConversations = catchAsync(async (req, res, next) => {
  const conversations = await Conversation.find({ user: req.user.id })
    .sort('-updatedAt')
    .select('-messages');

  res.status(200).json({
    status: 'success',
    results: conversations.length,
    data: {
      conversations
    }
  });
});

/**
 * @desc    Get a single conversation with messages
 * @route   GET /api/conversations/:id
 * @access  Private
 */
exports.getConversation = catchAsync(async (req, res, next) => {
  const conversation = await Conversation.findOne({
    _id: req.params.id,
    user: req.user.id
  });

  if (!conversation) {
    return next(new AppError('No conversation found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      conversation
    }
  });
});

/**
 * @desc    Update conversation (add message)
 * @route   PATCH /api/conversations/:id
 * @access  Private
 */
exports.updateConversation = catchAsync(async (req, res, next) => {
  const { messages, title } = req.body;
  
  const update = {};
  if (messages && messages.length > 0) {
    update.$push = { messages: { $each: messages } };
  }
  if (title) {
    update.title = title;
  }

  const conversation = await Conversation.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    update,
    { new: true, runValidators: true }
  );

  if (!conversation) {
    return next(new AppError('No conversation found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      conversation
    }
  });
});

/**
 * @desc    Delete a conversation (soft delete)
 * @route   DELETE /api/conversations/:id
 * @access  Private
 */
exports.deleteConversation = catchAsync(async (req, res, next) => {
  const conversation = await Conversation.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { isDeleted: true },
    { new: true }
  );

  if (!conversation) {
    return next(new AppError('No conversation found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});
