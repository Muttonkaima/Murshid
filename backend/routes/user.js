const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

// Get current user
router.get('/me', userController.getMe, userController.getUser);

// Update current user data (except password)
router.patch('/update-me', userController.updateMe);

// Complete user onboarding
router.post('/onboarding', userController.completeOnboarding);

// Mark user as onboarded (for OAuth users who don't need full onboarding)
router.patch('/me/onboarded', userController.markAsOnboarded);

// Delete current user (set active to false)
router.delete('/delete-me', userController.deleteMe);

// Restrict the following routes to admin only
router.use(authController.restrictTo('admin'));

// Admin routes for user management
router
  .route('/')
  .get(userController.getAllUsers);

router
  .route('/:id')
  .get(userController.getUser)
  .delete(userController.deleteUser);

module.exports = router;
