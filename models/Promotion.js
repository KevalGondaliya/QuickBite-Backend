const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema(
  {
    promoCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['first_order', 'restaurant_specific', 'zone_specific', 'percentage', 'fixed_amount'],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
    },
    // Conditions
    restaurantId: {
      type: String,
      default: null, // null means applicable to all restaurants
    },
    zoneType: {
      type: String,
      enum: ['Urban', 'Suburban', 'Remote', null],
      default: null, // null means applicable to all zones
    },
    minOrderAmount: {
      type: Number,
      default: 0,
    },
    maxDiscountAmount: {
      type: Number,
      default: null, // null means no limit
    },
    // Validity
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    usageLimit: {
      type: Number,
      default: null, // null means unlimited
    },
    usedCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
promotionSchema.index({ promoCode: 1, isActive: 1 });
promotionSchema.index({ type: 1, isActive: 1 });
promotionSchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model('Promotion', promotionSchema);

