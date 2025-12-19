# E-Commerce API 🛒

A comprehensive E-Commerce REST API with User, Seller, and Admin functionalities built with Node.js, Express, and MongoDB.

## 🌐 Live Demo

**Base URL:** https://crud-ecommerce-kfcr.onrender.com

**Swagger Documentation:** https://crud-ecommerce-kfcr.onrender.com/api-docs

## ✨ Features

- 👤 **User Management** - Registration, login, profile management
- 📦 **Product Management** - CRUD operations with search and filters
- 🛍️ **Order Management** - Place orders, view history, cancel orders
- 🔐 **Role-based Access** - User, Seller, and Admin roles
- 🔑 **JWT Authentication** - Secure API endpoints
- 📖 **Swagger Documentation** - Interactive API documentation

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (JSON Web Tokens)
- **Documentation:** Swagger (OpenAPI 3.0)
- **Deployment:** Render

## 📚 API Documentation

Access the interactive Swagger UI at: https://crud-ecommerce-kfcr.onrender.com/api-docs

## 🔗 API Endpoints

### 👤 User Routes (`/api/user`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Register new user | ❌ |
| POST | `/login` | User login | ❌ |
| GET | `/profile` | Get user profile | ✅ |
| PUT | `/profile` | Update profile | ✅ |
| PUT | `/change-password` | Change password | ✅ |
| POST | `/buy` | Place an order | ✅ |
| GET | `/orders` | Get user orders | ✅ |
| GET | `/order/:id` | Get specific order | ✅ |
| PUT | `/order/:id/cancel` | Cancel order | ✅ |

### 📦 Product Routes (`/api`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/viewproducts` | Get all products | ❌ |
| GET | `/product/:id` | Get product by ID | ❌ |
| GET | `/search` | Search products | ❌ |
| POST | `/addproduct` | Add product | ✅ Admin/Seller |
| PUT | `/product/:id` | Update product | ✅ Admin/Seller |
| DELETE | `/product/:id` | Delete product | ✅ Admin |

### 🔧 Admin Routes (`/api/admin`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/login` | Admin login | ❌ |
| POST | `/create` | Create admin | ❌ |
| GET | `/users` | Get all users | ✅ Admin |
| GET | `/sellers` | Get all sellers | ✅ Admin |
| GET | `/user/:id` | Get user by ID | ✅ Admin |
| DELETE | `/user/:id` | Delete user | ✅ Admin |
| PUT | `/user/:id/role` | Update user role | ✅ Admin |
| GET | `/dashboard` | Dashboard stats | ✅ Admin |
| GET | `/orders` | Get all orders | ✅ Admin |
| GET | `/order/:id` | Get order by ID | ✅ Admin |
| PUT | `/order/:id/status` | Update order status | ✅ Admin |
| PUT | `/product/:id` | Update product | ✅ Admin |
| DELETE | `/product/:id` | Delete product | ✅ Admin |

### 🏪 Seller Routes (`/api/seller`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Register seller | ❌ |
| POST | `/login` | Seller login | ❌ |
| GET | `/profile` | Get seller profile | ✅ Seller |
| PUT | `/profile` | Update profile | ✅ Seller |
| POST | `/addproduct` | Add product | ✅ Seller |
| GET | `/myproducts` | Get products | ✅ Seller |
| PUT | `/product/:id` | Update product | ✅ Seller |

## 🔐 Authentication

This API uses JWT (JSON Web Token) for authentication. 

### How to authenticate:

1. **Login** to get a token:
   ```bash
   POST /api/user/login
   {
     "email": "user@example.com",
     "password": "password123"
   }
   ```

2. **Use the token** in subsequent requests:
   ```
   Authorization: Bearer <your_token_here>
   ```

## 🚀 Local Development

### Prerequisites
- Node.js >= 18.0.0
- MongoDB Atlas account

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Abiram08/CRUD-Ecommerce.git
   cd CRUD-Ecommerce
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file**
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   PORT=3000
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Access the API**
   - API: http://localhost:3000
   - Swagger Docs: http://localhost:3000/api-docs

## 📁 Project Structure

```
├── config/
│   ├── db.js           # Database connection
│   └── swagger.js      # Swagger configuration
├── middleware/
│   └── auth.js         # Authentication middleware
├── models/
│   ├── user.js         # User model
│   ├── product.js      # Product model
│   └── order.js        # Order model
├── routes/
│   ├── userRoutes.js   # User routes
│   ├── productRoutes.js# Product routes
│   ├── adminRoutes.js  # Admin routes
│   └── sellerRoutes.js # Seller routes
├── index.js            # Express app configuration
├── server.js           # Server entry point
├── package.json
└── README.md
```

## 🌍 Deployment

This API is deployed on [Render](https://render.com).

### Environment Variables Required:
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT

## 👨‍💻 Author

**Abiram**

## 📄 License

MIT License
