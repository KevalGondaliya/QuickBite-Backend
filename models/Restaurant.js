const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: String,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    location: {
      lat: {
        type: Number,
        required: true,
      },
      lng: {
        type: Number,
        required: true,
      },
    },
    zone: {
      type: String,
      enum: ['Urban', 'Suburban', 'Remote'],
      required: true,
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

// Generate restaurantId before saving
restaurantSchema.pre('save', async function (next) {
  if (!this.restaurantId) {
    const count = await mongoose.model('Restaurant').countDocuments();
    this.restaurantId = `REST-${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Restaurant', restaurantSchema);

