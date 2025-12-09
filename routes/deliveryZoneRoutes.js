const express = require('express');
const router = express.Router();
const deliveryZoneController = require('../controller/deliveryZoneController');
const { protect } = require('../middleware/auth');

router.use(protect);

router
  .route('/')
  .post(deliveryZoneController.createDeliveryZone)
  .get(deliveryZoneController.getAllDeliveryZones);

router
  .route('/:zoneType')
  .get(deliveryZoneController.getDeliveryZone)

router
 .route('/:id')
 .patch(deliveryZoneController.updateDeliveryZone);

module.exports = router;
