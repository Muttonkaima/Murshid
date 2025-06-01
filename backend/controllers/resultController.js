const Result = require('../models/Result');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

/**
 * @desc    Save quiz result
 * @route   POST /api/results
 * @access  Private
 */
exports.saveResult = catchAsync(async (req, res, next) => {
  const {
    quizType,
    subject,
    branch,
    chapter,
    level,
    questions,
    scored,
    total_score,
    percentage
  } = req.body;

  const result = await Result.create({
    user: req.user.id,
    quizType,
    subject,
    branch,
    chapter,
    level,
    questions,
    scored,
    total_score,
    percentage
  });

  res.status(201).json({
    status: 'success',
    data: {
      result
    }
  });
});

/**
 * @desc    Get all results for the logged-in user
 * @route   GET /api/results
 * @access  Private
 */
exports.getUserResults = catchAsync(async (req, res, next) => {
  const results = await Result.find({ user: req.user.id })
    .sort('-date_time')
    .select('-__v');

  res.status(200).json({
    status: 'success',
    results: results.length,
    data: {
      results
    }
  });
});

/**
 * @desc    Get a specific result
 * @route   GET /api/results/:id
 * @access  Private
 */
exports.getResult = catchAsync(async (req, res, next) => {
  const result = await Result.findOne({
    _id: req.params.id,
    user: req.user.id
  }).select('-__v');

  if (!result) {
    return next(new AppError('No result found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      result
    }
  });
});

/**
 * @desc    Get results by subject
 * @route   GET /api/results/subject/:subjectId
 * @access  Private
 */
exports.getResultsBySubject = catchAsync(async (req, res, next) => {
  const results = await Result.find({
    user: req.user.id,
    subject: req.params.subjectId
  })
    .sort('-date_time')
    .select('-__v');

  res.status(200).json({
    status: 'success',
    results: results.length,
    data: {
      results
    }
  });
});

/**
 * @desc    Get user's progress
 * @route   GET /api/results/progress
 * @access  Private
 */
exports.getUserProgress = catchAsync(async (req, res, next) => {
  const results = await Result.aggregate([
    {
      $match: { user: req.user._id }
    },
    {
      $group: {
        _id: '$subject',
        totalQuizzes: { $sum: 1 },
        totalScore: { $sum: '$scored' },
        totalPossible: { $sum: '$total_score' },
        lastAttempt: { $max: '$date_time' }
      }
    },
    {
      $project: {
        subject: '$_id',
        totalQuizzes: 1,
        averageScore: { $round: [{ $multiply: [{ $divide: ['$totalScore', '$totalPossible'] }, 100] }, 2] },
        lastAttempt: 1
      }
    },
    {
      $sort: { lastAttempt: -1 }
    }
  ]);

  res.status(200).json({
    status: 'success',
    results: results.length,
    data: {
      progress: results
    }
  });
});
