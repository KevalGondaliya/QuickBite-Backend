const express = require('express');
const router = express.Router();
const promotionController = require('../controller/promotionController');
const {protect} = require('../middleware/auth');

router.use(protect);

router
  .route('/')
  .post(promotionController.createPromotion)
  .get(promotionController.getAllPromotions);

router
  .route('/:promoCode')
  .get(promotionController.getPromotion);

module.exports = router;

