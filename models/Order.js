const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Customer',
      index: true,
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
      ref: 'Restaurant',
    },
    items: [
      {
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'Item',
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
    deliveryZone: {
      type: String,
      enum: ['Urban', 'Suburban', 'Remote'],
      required: true,
    },
    distanceKm: {
      type: Number,
      required: true,
      min: 0,
    },
    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    deliveryFee: {
      type: Number,
      required: true,
      min: 0,
    },
    zoneBaseFee: {
      type: Number,
      required: true,
      min: 0,
    },
    distanceCost: {
      type: Number,
      required: true,
      min: 0,
    },
    peakMultiplier: {
      type: Number,
      required: true,
      min: 1,
    },
    peakSurcharge: {
      type: Number,
      required: true,
      min: 0,
    },
    promoDiscount: {
      type: Number,
      default: 0,
      min: 0,
    },
    promoCode: {
      type: String,
      default: null,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
orderSchema.index({ userId: 1, createdAt: -1 }); // For querying orders by logged-in user
orderSchema.index({ restaurantId: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model('Order', orderSchema);

