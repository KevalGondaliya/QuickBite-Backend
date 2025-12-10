# QuickBite Backend API

A comprehensive backend system for a food delivery service with dynamic pricing, delivery zones, and promotional engine.

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Pricing Logic](#pricing-logic)
- [Promotion Engine](#promotion-engine)
- [Bonus Questions](#bonus-questions)

## ✨ Features

### Core Features
- ✅ **Order Management**: Create and retrieve orders with full details
- ✅ **Dynamic Delivery Pricing**: Calculated based on distance, zone, and time
- ✅ **Delivery Zones**: Urban, Suburban, and Remote with configurable pricing
- ✅ **Peak Time Detection**: Automatic surcharge during peak hours and weekends
- ✅ **Promotion Engine**: Support for multiple promotion types (first order, restaurant-specific, zone-specific)

### Key Highlights
- **Scalable Architecture**: Service layer pattern for business logic separation
- **Flexible Pricing**: Zone-based pricing rules stored in database (easily updatable)
- **Smart Promotions**: Rule-based promotion system with eligibility validation
- **Distance Calculation**: Haversine formula for accurate distance calculation
- **Comprehensive Error Handling**: Proper validation and error responses

## 🏗️ Architecture

The application follows a **layered architecture** pattern:

```
Controller Layer → Service Layer → Model Layer
     ↓                ↓                ↓
  Routes         Business Logic    Database
```

### Layer Responsibilities

1. **Routes** (`/routes`): Define API endpoints and route requests to controllers
2. **Controllers** (`/controller`): Handle HTTP requests/responses, input validation
3. **Services** (`/services`): Contain business logic (pricing, promotions, order processing)
4. **Models** (`/models`): Define database schemas and data structures
5. **Middleware** (`/middleware`): Request validation, error handling
6. **Utils** (`/utils`): Helper functions (Error handler, date helpers)

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Environment**: dotenv for configuration

## 🚀 Setup & Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or remote instance)

### Installation Steps

1. **Clone the repository**
   ```bash
   cd QuickBite-Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/quickbite
   NODE_ENV=development
   JWT_SECRET=your-secret
   JWT_EXPIRES_IN=7d
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Start the server**
   ```bash
   npm start
   ```
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

6. **Verify the server is running**
   Visit `http://localhost:5000` to see the API information.

## 🗄️ Database Schema

### Models Overview

1. **Customer**: Stores customer information including location, zone, and first order flag
2. **Restaurant**: Stores restaurant details and location
3. **Item**: Product catalog with pricing
4. **Order**: Complete order information with all pricing details
5. **DeliveryZone**: Zone pricing rules (base fee, per km rate)
6. **Promotion**: Promotion rules and eligibility criteria

### Key Relationships
- Items belong to Restaurants (via `restaurantId` ObjectId)
- Orders reference Customers (via `userId` ObjectId) and Restaurants (via `restaurantId` ObjectId)
- Orders contain items array with `itemId` references
- Delivery Zones are referenced by Customer's `zone` field
- Promotions can be restaurant-specific or zone-specific

## 💰 Pricing Logic

### Delivery Fee Calculation Formula

```
Delivery Fee = (Base Fee + (Distance × Per Km Rate)) × Peak Multiplier
```

### Components

1. **Base Fee**: Zone-specific base delivery fee
   - Urban: 25
   - Suburban: 35
   - Remote: 50

2. **Distance Cost**: Distance (km) × Per Km Rate
   - Urban: 2.5 per km
   - Suburban: 3.2 per km
   - Remote: 4.5 per km

3. **Peak Multiplier**: Applied based on order time
   - Peak hours (7 PM - 10 PM): 1.3x
   - Weekend: 1.2x
   - Peak + Weekend: 1.4x
   - Normal time: 1.0x

### Distance Calculation

Uses the **Haversine formula** to calculate the great-circle distance between two coordinates (restaurant and customer locations).

### Example Calculation

For a Suburban zone order:
- Base Fee: 35
- Distance: 12.34 km
- Per Km Rate: 3.2
- Peak Multiplier: 1.0 (normal time)

```
Delivery Fee = (35 + (12.34 × 3.2)) × 1.0
             = (35 + 39.49) × 1.0
             = 74.49
```

## 🎁 Promotion Engine

### Promotion Types

1. **Restaurant-Specific** (`restaurant_specific`)
   - Valid only for specific restaurants
   - Example: 20% off at Burger King

2. **Zone-Specific** (`zone_specific`)
   - Valid only for specific delivery zones
   - Example: 15% off in Suburban zone

3. **Percentage Discount** (`percentage`)
   - Percentage-based discount with optional max limit

4. **Fixed Amount Discount** (`fixed_amount`)
   - Fixed amount discount

## 🧗 Bonus Questions

### 1. How would you handle bulk ordering (20+ items)?

**Approach:**
- **Batch Processing**: Process items in batches to avoid memory issues
- **Bulk Discount**: Implement tiered pricing (e.g., 5% off for 20+ items)
- **Validation**: Check restaurant capacity and item availability in batches
- **Optimization**: Use database aggregation for faster item lookups
- **Transaction Management**: Use MongoDB transactions to ensure data consistency

**Implementation:**
```javascript
// In OrderService.js
async createBulkOrder(orderData) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // Process items in batches of 10
    const batchSize = 10;
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      // Process batch...
    }
    // Apply bulk discount if applicable
    if (items.length >= 20) {
      basePrice *= 0.95; // 5% discount
    }
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  }
}
```

### 2. How would you handle distance calculation?

**Current Implementation:**
- Uses **Haversine formula** for great-circle distance
- Fast and accurate for most use cases
- No external API dependency

**Alternative Approaches:**

**a. Google Maps API:**
- **Pros**: Most accurate (considers roads, traffic), real-time data
- **Cons**: API costs, rate limits, external dependency
- **Use Case**: When accuracy is critical and budget allows

**b. Haversine Formula (Current):**
- **Pros**: Free, fast, no external calls, good for straight-line distance
- **Cons**: Less accurate for actual road distance
- **Use Case**: Good for estimation, MVP, cost-effective

**c. Hybrid Approach:**
- Cache Google Maps results for common routes
- Use Haversine for new/uncommon routes
- Fallback to Haversine if API fails

**Recommendation**: Start with Haversine, upgrade to Google Maps API when needed for production accuracy.

### 3. If restaurant moves location, how do you update pricing logic?

**Approach:**
- **Automatic Recalculation**: When restaurant location updates, recalculate all pending orders
- **Zone Detection**: Automatically detect new zone based on coordinates
- **Historical Data**: Keep old location in order history for reference
- **Notification**: Notify affected customers of potential price changes

**Implementation:**
```javascript
// In Restaurant model, add pre-save hook
restaurantSchema.pre('save', async function(next) {
  if (this.isModified('location') || this.isModified('zone')) {
    // Update pending orders
    await Order.updateMany(
      { restaurantId: this.restaurantId, status: 'pending' },
      { $set: { needsRecalculation: true } }
    );
    // Trigger recalculation service
    await PricingService.recalculatePendingOrders(this.restaurantId);
  }
  next();
});
```

**Database Design:**
- Store both current and previous locations
- Maintain order history with original pricing
- Use versioning for zone changes

### 4. How would you support multi-currency delivery fees?

**Approach:**
- **Currency Field**: Add currency to DeliveryZone model
- **Exchange Rates**: Store exchange rates (updated periodically)
- **Conversion Service**: Convert fees to customer's preferred currency
- **Display**: Show prices in both base and customer currency

**Implementation:**
```javascript
// Add to DeliveryZone model
currency: {
  type: String,
  default: 'PKR',
  enum: ['PKR', 'USD', 'EUR']
}

// In PricingService
async calculateDeliveryFee(..., customerCurrency = 'PKR') {
  const fee = // calculate in base currency
  if (customerCurrency !== baseCurrency) {
    const rate = await getExchangeRate(baseCurrency, customerCurrency);
    return fee * rate;
  }
  return fee;
}
```

**Database Design:**
- Store base prices in primary currency (PKR)
- Store exchange rates in separate collection
- Convert at display/calculation time
- Cache exchange rates for performance

## 📝 Notes

- **Authentication**: Order routes require JWT authentication via `Authorization: Bearer <token>` header
- **Order Time**: Orders use current time automatically (no `placedAt` field needed)
- **Peak Multiplier**: Calculated based on current time when order is created
  - Normal time: 1.0x
  - Peak hours (7 PM - 10 PM): 1.3x
  - Weekend: 1.2x
  - Peak + Weekend: 1.4x
- **Distance**: Calculated using Haversine formula in kilometers
- **Order Number**: Auto-generated format `ORD-YYYYMMDD-XXXXX` (e.g., "ORD-20251209-12345")
- **Items Response**: When retrieving orders, items include `name` and `price` (populated from Item collection)
- **Pricing Fields**: All pricing fields are stored separately (not nested in `feeBreakdown`)
- **Promotions**: Validated before application with comprehensive eligibility checks
