const express = require('express');
const resultController = require('../controllers/resultController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

// Result routes
router
  .route('/')
  .post(resultController.saveResult)
  .get(resultController.getUserResults);

router
  .route('/:id')
  .get(resultController.getResult);

router
  .route('/subject/:subjectId')
  .get(resultController.getResultsBySubject);

router
  .route('/progress')
  .get(resultController.getUserProgress);

module.exports = router;
