const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'E-Commerce API',
            version: '1.0.0',
            description: 'A comprehensive E-Commerce API with User, Seller, and Admin functionalities',
        },
        servers: [
            {
                url: process.env.RENDER_EXTERNAL_URL || 'http://localhost:3000',
                description: process.env.RENDER_EXTERNAL_URL ? 'Production server' : 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        name: { type: 'string' },
                        email: { type: 'string' },
                        password: { type: 'string' },
                        role: { type: 'string', enum: ['user', 'seller', 'admin'] },
                    },
                },
                Product: {
                    type: 'object',
                    properties: {
                        name: { type: 'string' },
                        price: { type: 'number' },
                        description: { type: 'string' },
                        color: { type: 'string' },
                        quantity: { type: 'number' },
                    },
                },
                Order: {
                    type: 'object',
                    properties: {
                        userId: { type: 'string' },
                        products: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    productId: { type: 'string' },
                                    name: { type: 'string' },
                                    price: { type: 'number' },
                                    quantity: { type: 'number' },
                                },
                            },
                        },
                        totalAmount: { type: 'number' },
                        shippingAddress: { type: 'string' },
                        status: { type: 'string', enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] },
                    },
                },
            },
        },
        tags: [
            { name: 'User Auth', description: 'User authentication endpoints' },
            { name: 'User Profile', description: 'User profile management' },
            { name: 'User Orders', description: 'User order management' },
            { name: 'Products', description: 'Product management endpoints' },
            { name: 'Seller Auth', description: 'Seller authentication endpoints' },
            { name: 'Seller Profile', description: 'Seller profile management' },
            { name: 'Seller Products', description: 'Seller product management' },
            { name: 'Admin Auth', description: 'Admin authentication endpoints' },
            { name: 'Admin Users', description: 'Admin user management' },
            { name: 'Admin Products', description: 'Admin product management' },
            { name: 'Admin Orders', description: 'Admin order management' },
        ],
    },
    apis: ['./routes/*.js'],
};

const specs = swaggerJsdoc(options);

module.exports = specs;
