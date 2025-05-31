const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required'],
    unique: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
    required: [true, 'Gender is required']
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  profileType: {
    type: String,
    enum: ['Student', 'Dropout', 'Repeating Year', 'Homeschooled', 'Other'],
    required: [true, 'Profile type is required']
  },
  class: {
    type: String,
    required: [true, 'Class is required'],
    trim: true
  },
  syllabus: {
    type: String,
    enum: ['CBSE', 'ICSE', 'State Board', 'Other'],
    required: [true, 'Syllabus is required'],
    trim: true
  },
  school: {
    type: String,
    required: [true, 'School/Institution is required'],
    trim: true
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot be more than 500 characters'],
    trim: true,
    default: ''
  },
  profileImage: {
    type: String,
    default: 'default.jpg'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for user reference
profileSchema.index({ user: 1 });

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;
