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
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
        required: true,
      },
      coordinates: [
        {
          type: Number,
          required: true,
        },
        {
          type: Number,
          required: true,
        }
      ]
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

restaurantSchema.index({ location: '2dsphere' });

// Generate restaurantId before saving
restaurantSchema.pre('save', async function (next) {
  if (!this.restaurantId) {
    const count = await mongoose.model('Restaurant').countDocuments();
    this.restaurantId = `REST-${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Restaurant', restaurantSchema);

