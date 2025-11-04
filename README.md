# EventOh - Event Management Platform API

EventOh is a comprehensive event management platform that connects customers with event service providers. The platform supports three types of vendors: **Venue Owners**, **Event Teams**, and **Freelancers** (photographers, caterers, decorators, etc.).

## 🚀 Features

### User Management
- **Multi-role Authentication**: Support for Customers, Vendors, and Admins
- **JWT-based Authentication**: Secure token-based authentication
- **Profile Management**: User profiles with profile photo uploads via Cloudinary

### Vendor Types

#### 1. **Venue Owners**
- List multiple venue units/halls under a single vendor account
- Each venue unit includes:
  - Capacity, pricing (per day/hour)
  - Amenities (AC, Parking, WiFi, etc.)
  - Image galleries
  - Verification status (admin-verified)

#### 2. **Event Teams**
- Complete event management services
- Package-based offerings (Basic, Standard, Premium)
- Event types covered (Wedding, Corporate, Birthday, etc.)
- Service inclusions/exclusions per package

#### 3. **Freelancers**
- Individual service providers
- Categories: Photographer, Videographer, Caterer, Mehndi Artist, Decorator, Priest, DJ, Anchor, Makeup Artist, etc.
- Portfolio showcase
- Base pricing and ratings

### Booking System
- Create bookings for venues, event teams, or freelancers
- Date-based availability tracking
- Booking status management (pending, confirmed, cancelled, completed)
- Support for advance payments and remaining balance tracking

### Payment Integration
- **Stripe Payment Gateway**: Secure online payments
- Payment status tracking (pending, partial, paid, refunded)
- Automated payment reminders for completed bookings with pending payments
- Support for advance payments and remaining balance payments

### Admin Features
- View all vendors and their details
- Verify venue units (admin verification badge)
- Manage platform content and users

### Additional Features
- **Image Upload**: Cloudinary integration for profile photos, portfolios, and venue images
- **Email Notifications**: Automated email reminders via Nodemailer
- **Scheduled Jobs**: Automated payment reminder cron jobs
- **API Documentation**: Swagger/OpenAPI documentation at `/api-docs`
- **Health Check**: Server health monitoring endpoint

## 🛠️ Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js 5.1.0
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Payment Gateway**: Stripe
- **Image Upload**: Cloudinary, Multer
- **Email Service**: Nodemailer
- **Scheduling**: node-cron
- **API Documentation**: Swagger (swagger-jsdoc, swagger-ui-express)
- **Deployment**: Vercel-ready

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB database (local or cloud instance)
- Cloudinary account (for image uploads)
- Stripe account (for payments)
- Gmail account (for email notifications)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd EventOh-Server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory with the following variables:
   ```env
   # Server Configuration
   PORT=5000
   
   # MongoDB
   MONGO_URI=your_mongodb_connection_string
   
   # JWT Secret
   JWT_SECRET=your_jwt_secret_key
   
   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   
   # Stripe
   STRIPE_SECRET_KEY=your_stripe_secret_key
   
   # Email (Gmail)
   EMAIL_USER=your_gmail_address
   EMAIL_PASS=your_gmail_app_password
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   Or for production:
   ```bash
   npm start
   ```

## 📁 Project Structure

```
EventOh-Server/
├── config/
│   ├── cloudinary.js      # Cloudinary configuration
│   ├── db.js              # MongoDB connection
│   └── Swagger.js         # Swagger API documentation setup
├── controllers/
│   ├── AdminController.js      # Admin operations
│   ├── AuthController.js       # Authentication logic
│   ├── BookingController.js    # Booking management
│   ├── CustomerController.js   # Customer operations
│   ├── ImageUploadController.js # Image upload handling
│   └── VendorController.js     # Vendor operations
├── jobs/
│   └── paymentReminderJob.js   # Scheduled payment reminders
├── middleware/
│   ├── uploadImage.js          # Multer image upload middleware
│   └── verifyToken.js          # JWT authentication middleware
├── models/
│   ├── Booking.js              # Booking schema
│   ├── User.js                 # User schema
│   └── Vendor.js               # Vendor schema
├── routes/
│   ├── adminRoutes.js          # Admin endpoints
│   ├── auth.js                 # Authentication routes
│   ├── Booking.js              # Booking routes
│   ├── Customer.js             # Customer routes
│   ├── payment.js              # Payment routes
│   └── Vendor.js               # Vendor routes
├── services/
│   └── (service layer - if any)
├── utils/
│   └── mailer.js               # Email utility
├── server.js                   # Main application entry point
├── package.json
└── vercel.json                 # Vercel deployment configuration
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new customer
- `POST /api/auth/vendorRegister` - Register a new vendor
- `POST /api/auth/login` - Login (all user types)

### Vendors
- `GET /api/vendors` - Get all vendors (with filters: type, city, category)
- `GET /api/vendors/:id` - Get vendor by ID
- `GET /api/vendors/myProfile` - Get logged-in vendor profile (protected)
- `PUT /api/vendors/:id` - Update vendor profile (protected)
- `PATCH /api/vendors/:id/availability` - Update booked dates (protected)
- `GET /api/vendors/:id/booked-dates` - Get vendor's booked dates
- `POST /api/vendors/:id/upload` - Upload vendor images (protected)

### Bookings
- `POST /api/bookings` - Create a new booking (protected)
- `GET /api/bookings` - Get user's bookings (protected)
- `PUT /api/bookings/:id/status` - Update booking status (protected)
- `POST /api/bookings/:id/pay-remaining` - Pay remaining balance (protected)
- `PUT /api/bookings/:id/mark-paid` - Mark payment as completed (protected)

### Payments
- `POST /api/payments/create-checkout-session` - Create Stripe checkout session

### Admin
- `GET /api/admin/vendors` - Get all vendors (admin only)
- `PUT /api/admin/vendors/:vendorId/venue/:venueId/verify` - Verify venue unit (admin only)

### Customers
- `GET /api/customers` - Customer-related endpoints

### Health Check
- `GET /health` - Server health status
- `GET /` - API status message

### API Documentation
- `GET /api-docs` - Swagger API documentation (interactive)

## 🔐 Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## 📝 Usage Examples

### Register a Customer
```bash
POST /api/auth/register
Content-Type: multipart/form-data

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "profilePhoto": <file>
}
```

### Register a Venue Vendor
```bash
POST /api/auth/vendorRegister
Content-Type: multipart/form-data

{
  "name": "Royal Banquets",
  "email": "royal@example.com",
  "password": "password123",
  "type": "venue",
  "city": "Mumbai",
  "venue[0].title": "Grand Ballroom",
  "venue[0].capacity": 300,
  "venue[0].pricePerDay": 50000,
  "venue[0].amenities": "AC,Parking,WiFi",
  "profilePhoto": <file>,
  "venue[0].images": [<files>]
}
```

### Create a Booking
```bash
POST /api/bookings
Authorization: Bearer <token>
Content-Type: application/json

{
  "vendorId": "vendor_id_here",
  "startDate": "2025-12-01T10:00:00Z",
  "endDate": "2025-12-01T18:00:00Z",
  "totalAmount": 50000,
  "advanceAmount": 15000,
  "bookingType": "venue",
  "venueUnitId": "venue_unit_id_here"
}
```

## 🚢 Deployment

### Vercel Deployment

The project includes `vercel.json` for easy Vercel deployment:

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Set environment variables in Vercel dashboard

## 🔄 Scheduled Jobs

The application includes automated cron jobs:
- **Payment Reminder Job**: Runs daily at midnight, sends email reminders to customers with completed bookings that have pending payments.

## 📚 API Documentation

Interactive API documentation is available at `/api-docs` when the server is running. It provides:
- Complete endpoint documentation
- Request/response schemas
- Authentication requirements
- Try-it-out functionality

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

ISC

## 👥 Authors

EventOh Development Team

## 📧 Support

For support, email support@eventoh.com or open an issue in the repository.

---

**Note**: Make sure to set up all environment variables before running the application. The application requires MongoDB, Cloudinary, Stripe, and email service credentials to function properly.

