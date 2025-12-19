# E-Commerce API

A comprehensive E-Commerce REST API with User, Seller, and Admin functionalities built with Node.js, Express, and MongoDB.

## Features

- **User Management**: Registration, login, profile management
- **Product Management**: CRUD operations with search and filters
- **Order Management**: Place orders, view order history, cancel orders
- **Role-based Access**: User, Seller, and Admin roles
- **JWT Authentication**: Secure API endpoints
- **Swagger Documentation**: Interactive API documentation

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Swagger for API documentation

## API Documentation

Access Swagger UI at `/api-docs` after starting the server.

## Environment Variables

Create a `.env` file in the root directory with:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=3000
```

## Local Development

```bash
# Install dependencies
npm install

# Start server
npm start
```

## Deploy to Render

### Option 1: Deploy via Render Dashboard

1. Push your code to GitHub (ensure `.env` is in `.gitignore`)
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click **New** → **Web Service**
4. Connect your GitHub repository
5. Configure the service:
   - **Name**: ecommerce-api
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Add Environment Variables:
   - `MONGO_URI` - Your MongoDB Atlas connection string
   - `JWT_SECRET` - Your JWT secret key
7. Click **Create Web Service**

### Option 2: Deploy via render.yaml

The project includes a `render.yaml` file for Blueprint deployment.

1. Push code to GitHub
2. Go to Render Dashboard → **Blueprints**
3. Connect your repository
4. Add environment variables when prompted

## API Endpoints

### User Routes (`/api/user`)
- `POST /register` - Register new user
- `POST /login` - User login
- `GET /profile` - Get user profile
- `PUT /profile` - Update profile
- `PUT /change-password` - Change password
- `POST /buy` - Place an order
- `GET /orders` - Get user orders
- `GET /order/:id` - Get specific order
- `PUT /order/:id/cancel` - Cancel order

### Product Routes (`/api`)
- `GET /viewproducts` - Get all products
- `GET /product/:id` - Get product by ID
- `GET /search` - Search products
- `POST /addproduct` - Add product (Admin/Seller)
- `PUT /product/:id` - Update product (Admin/Seller)
- `DELETE /product/:id` - Delete product (Admin)

### Admin Routes (`/api/admin`)
- `POST /login` - Admin login
- `POST /create` - Create admin
- `GET /users` - Get all users
- `GET /sellers` - Get all sellers
- `GET /user/:id` - Get user by ID
- `DELETE /user/:id` - Delete user
- `PUT /user/:id/role` - Update user role
- `GET /dashboard` - Dashboard stats
- `GET /orders` - Get all orders
- `PUT /order/:id/status` - Update order status

### Seller Routes (`/api/seller`)
- `POST /register` - Register seller
- `POST /login` - Seller login
- `GET /profile` - Get seller profile
- `PUT /profile` - Update profile
- `POST /addproduct` - Add product
- `GET /myproducts` - Get products
- `PUT /product/:id` - Update product

## License

MIT
