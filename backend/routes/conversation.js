const express = require('express');
const conversationController = require('../controllers/conversationController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

router
  .route('/')
  .post(conversationController.createConversation)
  .get(conversationController.getUserConversations);

router
  .route('/:id')
  .get(conversationController.getConversation)
  .patch(conversationController.updateConversation)
  .delete(conversationController.deleteConversation);

module.exports = router;
