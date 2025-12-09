const express = require('express');
const router = express.Router();
const orderController = require('../controller/orderController');
const {protect} = require('../middleware/auth');

router.use(protect);

router
  .route('/')
  .post(orderController.createOrder);

router
  .route('/:id')
  .get(orderController.getOrder);

module.exports = router;
