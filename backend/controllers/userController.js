const User = require('../models/User');
const Profile = require('../models/Profile');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// Helper function to filter object fields
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// Get all users (Admin only)
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users
    }
  });
});

// Complete user onboarding
exports.completeOnboarding = catchAsync(async (req, res, next) => {
  // 1) Get user from the request (protected route)
  const userId = req.user.id;
  
  // 2) Filter allowed fields
  const allowedFields = ['gender', 'dateOfBirth', 'profileType', 'class', 'syllabus', 'school', 'bio'];
  const filteredBody = {};
  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) {
      filteredBody[key] = req.body[key];
    }
  });

  // 3) Check if profile already exists
  let profile = await Profile.findOne({ user: userId });

  if (profile) {
    // Update existing profile
    Object.assign(profile, filteredBody);
    await profile.save();
  } else {
    // Create new profile
    profile = await Profile.create({
      user: userId,
      ...filteredBody
    });
  }

  // 4) Mark user as onboarded
  await User.findByIdAndUpdate(userId, { onboarded: true });

  // 5) Send response
  res.status(200).json({
    status: 'success',
    data: {
      profile
    }
  });
});

// Mark user as onboarded
exports.markAsOnboarded = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { onboarded: true });
  
  res.status(200).json({
    status: 'success',
    data: null
  });
});

// Get current user profile
exports.getMe = catchAsync(async (req, res, next) => {
  // 1) Get user data
  const user = await User.findById(req.user.id).select('-__v -password');
  
  if (!user) {
    return next(new AppError('No user found with this ID', 404));
  }
  
  // 2) Get or create profile
  let profile = await Profile.findOne({ user: req.user.id });
  
  if (!profile) {
    // Create a default profile if none exists
    profile = await Profile.create({
      user: req.user.id,
      gender: 'Prefer not to say',
      dateOfBirth: new Date(),
      profileType: 'Student',
      class: 'Class 1',
      syllabus: 'CBSE',
      school: 'Other',
      bio: ''
    });
  }
  
  // 3) Send response with combined user and profile data
  res.status(200).json({
    status: 'success',
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        onboarded: user.onboarded
      },
      profile: {
        id: profile._id,
        gender: profile.gender,
        dateOfBirth: profile.dateOfBirth,
        profileType: profile.profileType,
        class: profile.class,
        syllabus: profile.syllabus,
        school: profile.school,
        bio: profile.bio,
        profileImage: profile.profileImage
      }
    }
  });
});

// Get user by ID
exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

// Update current user data
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    );
  }
  
  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'firstName', 'lastName', 'email');
  
  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  // 4) If profile data is being updated, update the profile as well
  const profileData = filterObj(
    req.body,
    'gender',
    'dateOfBirth',
    'profileType',
    'class',
    'syllabus',
    'school',
    'bio',
    'profileImage'
  );

  if (Object.keys(profileData).length > 0) {
    await Profile.findOneAndUpdate(
      { user: req.user.id },
      profileData,
      { new: true, runValidators: true }
    );
  }
  
  // 5) Get updated profile data
  const profile = await Profile.findOne({ user: req.user.id });
  
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
      profile: profile || {}
    }
  });
});

// Delete current user (set active to false)
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Delete user (Admin only)
exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  
  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});
