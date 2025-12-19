const express = require('express');
const app = express();
app.use(express.json());
require('dotenv').config();

const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');

const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const sellerRoutes = require('./routes/sellerRoutes');

connectDB();

// Request Logger Middleware
app.use((req, res, next) => {
    const start = Date.now();
    
    // Log request
    console.log(`📥 [${new Date().toISOString()}] ${req.method} ${req.url}`);
    
    // Log response when finished
    res.on('finish', () => {
        const duration = Date.now() - start;
        const statusColor = res.statusCode >= 400 ? '❌' : '✅';
        console.log(`📤 [${new Date().toISOString()}] ${statusColor} ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
    });
    
    next();
});

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

app.use('/api', productRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/seller', sellerRoutes);

app.get('/', (req, res) => {
    res.send({ message: "Welcome to E-Commerce API", version: "1.0.0" });
});

// 404 Handler
app.use((req, res) => {
    console.log(`⚠️ 404 - Route not found: ${req.method} ${req.url}`);
    res.status(404).send({ message: "Route not found" });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error(`❌ Error: ${err.message}`);
    console.error(err.stack);
    res.status(500).send({ message: "Internal server error", error: err.message });
});

module.exports = app;