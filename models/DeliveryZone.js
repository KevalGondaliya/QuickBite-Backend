const mongoose = require('mongoose');

const deliveryZoneSchema = new mongoose.Schema(
  {
    zoneType: {
      type: String,
      enum: ['Urban', 'Suburban', 'Remote'],
      required: true,
      unique: true,
    },
    baseFee: {
      type: Number,
      required: true,
      min: 0,
    },
    perKmRate: {
      type: Number,
      required: true,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster lookups
deliveryZoneSchema.index({ zoneType: 1, isActive: 1 });

module.exports = mongoose.model('DeliveryZone', deliveryZoneSchema);

