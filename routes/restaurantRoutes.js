const express = require('express');
const router = express.Router();
const restaurantController = require('../controller/restaurant');
const { protect } = require('../middleware/auth');

router.use(protect);

router
  .route('/')
  .post(restaurantController.createRestaurant)
  .get(restaurantController.getAllRestaurants);

router
  .route('/:id')
  .get(restaurantController.getRestaurant);

module.exports = router;

