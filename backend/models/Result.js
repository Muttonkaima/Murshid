const mongoose = require('mongoose');

// Question subdocument schema
const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Question text is required']
  },
  user_answer: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'User answer is required']
  },
  correct_answer: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'Correct answer is required']
  },
  explanation: {
    type: String,
    required: [true, 'Explanation is required']
  },
  status: {
    type: String,
    enum: ['correct', 'incorrect', 'partially_correct'],
    required: [true, 'Status is required']
  }
}, { _id: true });

// Main Result schema
const resultSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  quizType: {
    type: String,
    enum: ['syllabus', 'fundamentals'],
    required: [true, 'Quiz type is required']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required']
  },
  branch: {
    type: String,
    required: [
      function() { return this.quizType === 'syllabus'; },
      'Branch is required for syllabus quizzes'
    ]
  },
  chapter: {
    type: String,
    required: [
      function() { return this.quizType === 'syllabus'; },
      'Chapter is required for syllabus quizzes'
    ]
  },
  level: {
    type: String,
    required: [
      function() { return this.quizType === 'fundamentals'; },
      'Level is required for fundamental quizzes'
    ]
  },
  questions: [questionSchema],
  scored: {
    type: Number,
    required: [true, 'Scored marks are required'],
    min: [0, 'Scored marks cannot be negative']
  },
  total_score: {
    type: Number,
    required: [true, 'Total score is required'],
    min: [1, 'Total score must be at least 1']
  },
  percentage: {
    type: Number,
    required: [true, 'Percentage is required'],
    min: [0, 'Percentage cannot be negative'],
    max: [100, 'Percentage cannot exceed 100']
  },
  date_time: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add indexes for faster querying
resultSchema.index({ user: 1, date_time: -1 });
resultSchema.index({ user: 1, subject: 1, date_time: -1 });
resultSchema.index({ user: 1, quizType: 1, date_time: -1 });

// Virtual for formatted date
resultSchema.virtual('formatted_date').get(function() {
  return this.date_time.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Pre-save hook to calculate percentage if not provided
resultSchema.pre('save', function(next) {
  if (this.isModified('scored') || this.isModified('total_score')) {
    this.percentage = (this.scored / this.total_score) * 100;
  }
  next();
});

// Create and export the model
const Result = mongoose.model('Result', resultSchema);
module.exports = Result;
