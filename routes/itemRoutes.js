const express = require('express');
const router = express.Router();
const itemController = require('../controller/itemController');
const {protect} = require('../middleware/auth');

router.use(protect);

router
  .route('/')
  .post(itemController.createItem)
  .get(itemController.getAllItems);

router
  .route('/:id')
  .get(itemController.getItem)
  .patch(itemController.updateItem);

module.exports = router;

