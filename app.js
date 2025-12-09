const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const orderRoutes = require('./routes/orderRoutes');
const authRoutes = require('./routes/authRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const deliveryZoneRoutes = require('./routes/deliveryZoneRoutes');
const itemRoutes = require('./routes/itemRoutes');
const promotionRoutes = require('./routes/promotionRoutes');
const errorHandler = require('./middleware/errorHandler');
const response = require('./middleware/response');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI ;

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 20000, // Timeout after 20s instead of 30s
    });
    
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('\n MongoDB connection error:', error.message);
    process.exit(1);
  }
};

connectDB();

app.get('/', (req, res) => {
  return response(res, 200, true, 'API is running');
});

app.use('/v1/auth', authRoutes);
app.use('/v1/restaurants', restaurantRoutes);
app.use('/v1/delivery-zones', deliveryZoneRoutes);
app.use('/v1/items', itemRoutes);
app.use('/v1/promotions', promotionRoutes);
app.use('/v1/orders', orderRoutes);

app.use(errorHandler);

app.use((req, res) => {
  return response(res, 404, false, 'Route not found', null);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;

