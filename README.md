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
6. **Utils** (`/utils`): Helper functions (distance calculation, date helpers)

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Environment**: dotenv for configuration

## 📁 Project Structure

```
QuickBite-Backend/
├── app.js                      # Main application entry point
├── package.json                # Dependencies and scripts
├── .env                        # Environment variables
├── .gitignore                  # Git ignore rules
├── README.md                   # This file
│
├── models/                     # Database models
│   ├── Customer.js
│   ├── Restaurant.js
│   ├── Item.js
│   ├── Order.js
│   ├── DeliveryZone.js
│   └── Promotion.js
│
├── routes/                     # API routes
│   └── orderRoutes.js
│
├── controller/                 # Request handlers
│   └── orderController.js
│
├── services/                   # Business logic layer
│   ├── OrderService.js
│   ├── PricingService.js
│   └── PromoService.js
│
├── middleware/                 # Middleware functions
│   ├── errorHandler.js
│   └── validator.js
│
├── utils/                      # Utility functions
│   ├── distanceCalculator.js
│   ├── dateHelper.js
│   └── orderHelper.js
│
└── scripts/                    # Utility scripts
    └── seedData.js             # Database seeding script
```

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
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/quickbite
   NODE_ENV=development
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Seed the database** (optional but recommended)
   ```bash
   npm run seed
   ```
   This will populate the database with sample customers, restaurants, items, delivery zones, and promotions.

6. **Start the server**
   ```bash
   npm start
   ```
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

7. **Verify the server is running**
   Visit `http://localhost:3000` to see the API information.

## 📡 API Endpoints

### 1. Create Order
**POST** `/v1/orders`

Creates a new order with dynamic pricing calculation. Requires authentication.

**Request Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "customerId": "CUST-001",
  "restaurantId": "6937d14576ea818b22e8c433",
  "items": [
    {
      "itemId": "6937f0cebe55b5357f4522f9",
      "qty": 2
    },
    {
      "itemId": "6937f0cebe55b5357f4522f0",
      "qty": 1
    }
  ],
  "promoCode": "FIRST50"
}
```

**Field Descriptions:**
- `customerId` (required): Customer ID string (e.g., "CUST-001")
- `restaurantId` (required): Restaurant MongoDB ObjectId or restaurantId string
- `items` (required): Array of items with `itemId` (MongoDB ObjectId) and `qty` (quantity)
- `promoCode` (optional): Promotion code string

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "orderNumber": "ORD-20251209-12345",
    "orderId": "69380c68811648fd783832cf",
    "userId": "6937cc5f946201b1b305ba51",
    "restaurantId": "6937d14576ea818b22e8c433",
    "items": [
      {
        "itemId": "6937f0cebe55b5357f4522f9",
        "quantity": 2
      },
      {
        "itemId": "6937f0cebe55b5357f4522f0",
        "quantity": 1
      }
    ],
    "deliveryZone": "Suburban",
    "distanceKm": 4.61,
    "basePrice": 450,
    "deliveryFee": 280.5,
    "zoneBaseFee": 50,
    "distanceCost": 230.5,
    "peakMultiplier": 1,
    "peakSurcharge": 0,
    "promoDiscount": 0,
    "promoCode": null,
    "totalAmount": 730.5,
    "status": "pending"
  }
}
```

### 2. Get Order Details
**GET** `/v1/orders/:id`

Retrieves order details by order ID (MongoDB ObjectId) or order number. Requires authentication.

**Request Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "success": true,
  "message": "Order get successfully",
  "data": {
    "order": {
      "orderNumber": "ORD-20251209-12345",
      "orderId": "69380c68811648fd783832cf",
      "userId": "6937cc5f946201b1b305ba51",
      "restaurantId": "6937d14576ea818b22e8c433",
      "items": [
        {
          "itemId": "6937f0cebe55b5357f4522f9",
          "name": "Chicken Burger",
          "price": 450,
          "quantity": 1
        }
      ],
      "deliveryZone": "Suburban",
      "distanceKm": 4.61,
      "basePrice": 450,
      "deliveryFee": 280.5,
      "zoneBaseFee": 50,
      "distanceCost": 230.5,
      "peakMultiplier": 1,
      "peakSurcharge": 0,
      "promoDiscount": 0,
      "promoCode": null,
      "totalAmount": 730.5,
      "status": "pending",
      "createdAt": "2025-12-09T11:50:14.056Z",
      "updatedAt": "2025-12-09T11:50:14.056Z"
    },
    "customer": {
      "name": "Test User",
      "email": "test@gmail.com",
      "location": {
        "lat": 24.9,
        "lng": 66.99
      },
      "zone": "Suburban"
    },
    "restaurant": {
      "name": "KFC Gulshan",
      "location": {
        "lat": 24.88,
        "lng": 67.03
      },
      "zone": "Suburban"
    }
  }
}
```

## 🗄️ Database Schema

### Models Overview

1. **Customer**: Stores customer information including location, zone, and first order flag
2. **Restaurant**: Stores restaurant details and location
3. **Item**: Product catalog with pricing
4. **Order**: Complete order information with all pricing details
5. **DeliveryZone**: Zone pricing rules (base fee, per km rate)
6. **Promotion**: Promotion rules and eligibility criteria

### Order Schema Structure

```javascript
{
  orderNumber: String (unique),      // Human-readable order ID (e.g., "ORD-20251209-12345")
  userId: ObjectId,                  // Reference to Customer (for querying by logged-in user)
  restaurantId: ObjectId,            // Reference to Restaurant
  items: [                           // Array of order items
    {
      itemId: ObjectId,              // Reference to Item
      quantity: Number              // Quantity ordered
    }
  ],
  deliveryZone: String,              // "Urban" | "Suburban" | "Remote"
  distanceKm: Number,                // Calculated distance in kilometers
  basePrice: Number,                 // Total price of all items
  deliveryFee: Number,               // Final delivery fee
  zoneBaseFee: Number,               // Base fee for the zone
  distanceCost: Number,              // Cost based on distance
  peakMultiplier: Number,            // Peak time multiplier (1.0, 1.2, 1.3, or 1.4)
  peakSurcharge: Number,             // Extra charge during peak times
  promoDiscount: Number,             // Discount from promotion
  promoCode: String,                 // Applied promotion code
  totalAmount: Number,               // Final total amount
  status: String,                    // Order status
  createdAt: Date,                   // Order creation timestamp
  updatedAt: Date                    // Last update timestamp
}
```

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

1. **First Order Discount** (`first_order`)
   - Valid only for first-time customers
   - Example: 50% off up to 200

2. **Restaurant-Specific** (`restaurant_specific`)
   - Valid only for specific restaurants
   - Example: 20% off at Burger King

3. **Zone-Specific** (`zone_specific`)
   - Valid only for specific delivery zones
   - Example: 15% off in Suburban zone

4. **Percentage Discount** (`percentage`)
   - Percentage-based discount with optional max limit

5. **Fixed Amount Discount** (`fixed_amount`)
   - Fixed amount discount

### Promotion Validation

The system validates:
- ✅ Promotion code exists and is active
- ✅ Promotion is within validity dates
- ✅ Usage limit not exceeded
- ✅ Minimum order amount met
- ✅ Type-specific eligibility (first order, restaurant, zone)
- ✅ Discount doesn't exceed order amount

### How to Add New Promotion Types

The system is designed to be extensible. To add new promotion types:

1. Add the new type to the `Promotion` model enum
2. Add validation logic in `PromoService.validateAndApplyPromo()`
3. Update the promotion creation logic

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

## 🧪 Testing the API

### Using Postman

**Create an Order:**
1. Method: `POST`
2. URL: `http://localhost:3000/v1/orders`
3. Headers:
   - `Content-Type: application/json`
   - `Authorization: Bearer <YOUR_JWT_TOKEN>`
4. Body (raw JSON):
```json
{
  "customerId": "CUST-001",
  "restaurantId": "6937d14576ea818b22e8c433",
  "items": [
    {
      "itemId": "6937f0cebe55b5357f4522f9",
      "qty": 1
    }
  ]
}
```

**Get Order:**
1. Method: `GET`
2. URL: `http://localhost:3000/v1/orders/ORD-20251209-12345` or `http://localhost:3000/v1/orders/<orderId>`
3. Headers:
   - `Authorization: Bearer <YOUR_JWT_TOKEN>`

### Using cURL

**Create an Order:**
```bash
curl -X POST http://localhost:3000/v1/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -d '{
    "customerId": "CUST-001",
    "restaurantId": "6937d14576ea818b22e8c433",
    "items": [
      {
        "itemId": "6937f0cebe55b5357f4522f9",
        "qty": 1
      }
    ],
    "promoCode": "FIRST50"
  }'
```

**Get Order:**
```bash
curl -X GET http://localhost:3000/v1/orders/ORD-20251209-12345 \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

### Using Postman

1. Import the endpoints
2. Use the sample request body from the API documentation above
3. Test with different scenarios (peak time, promotions, different zones)

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
- **First Order Flag**: Customer's `isFirstOrder` flag is automatically updated after first order

## 🔮 Future Enhancements

- [ ] Order status management endpoints
- [ ] Restaurant and customer management APIs
- [ ] Analytics and reporting
- [ ] Real-time order tracking
- [ ] Integration with payment gateways
- [ ] Email/SMS notifications
- [ ] Rate limiting and API authentication
- [ ] Caching layer for frequently accessed data
- [ ] GraphQL API option

## 📄 License

This project is created for assignment purposes.

---

**Built with ❤️ for QuickBite Food Delivery System**