const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Product = require('../models/product');
const Order = require('../models/order');
const { authenticate, isUser } = require('../middleware/auth');

/**
 * @swagger
 * /api/user/register:
 *   post:
 *     summary: Register a new user
 *     tags: [User Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: User already exists or validation error
 */
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send({ message: "User already exists with this email" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            email,
            password: hashedPassword,
            role: 'user'
        });

        await user.save();
        res.status(201).send({ message: "User registered successfully", user: { name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        res.status(400).send({ message: "Error registering user", error: error.message });
    }
});

/**
 * @swagger
 * /api/user/login:
 *   post:
 *     summary: Login user and get JWT token
 *     tags: [User Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful, JWT token returned
 *       400:
 *         description: Invalid email or password
 *       500:
 *         description: Server error
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).send({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send({ message: "Invalid email or password" });
        }

        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });

        res.status(200).send({ 
            message: "Login successful", 
            token, 
            user: { name: user.name, email: user.email, role: user.role } 
        });
    } catch (error) {
        res.status(500).send({ message: "Error logging in", error: error.message });
    }
});

/**
 * @swagger
 * /api/user/profile:
 *   get:
 *     summary: Get logged-in user profile
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/profile', authenticate, async (req, res) => {
    try {
        res.status(200).send({ 
            user: { 
                name: req.user.name, 
                email: req.user.email, 
                role: req.user.role 
            } 
        });
    } catch (error) {
        res.status(500).send({ message: "Error fetching profile", error: error.message });
    }
});

/**
 * @swagger
 * /api/user/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Error updating profile
 *       401:
 *         description: Unauthorized
 */
router.put('/profile', authenticate, async (req, res) => {
    try {
        const { name, email } = req.body;
        
        const user = await User.findByIdAndUpdate(
            req.user._id, 
            { name, email }, 
            { new: true }
        );

        res.status(200).send({ 
            message: "Profile updated successfully", 
            user: { name: user.name, email: user.email, role: user.role } 
        });
    } catch (error) {
        res.status(400).send({ message: "Error updating profile", error: error.message });
    }
});

/**
 * @swagger
 * /api/user/change-password:
 *   put:
 *     summary: Change user password
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Current password incorrect or error
 *       401:
 *         description: Unauthorized
 */
router.put('/change-password', authenticate, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const isMatch = await bcrypt.compare(currentPassword, req.user.password);
        if (!isMatch) {
            return res.status(400).send({ message: "Current password is incorrect" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.findByIdAndUpdate(req.user._id, { password: hashedPassword });

        res.status(200).send({ message: "Password changed successfully" });
    } catch (error) {
        res.status(400).send({ message: "Error changing password", error: error.message });
    }
});

/**
 * @swagger
 * /api/user/buy:
 *   post:
 *     summary: Place an order (buy products)
 *     tags: [User Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - products
 *               - shippingAddress
 *             properties:
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                     quantity:
 *                       type: number
 *               shippingAddress:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order placed successfully
 *       400:
 *         description: No products or insufficient stock
 *       404:
 *         description: Product not found
 *       401:
 *         description: Unauthorized
 */
router.post('/buy', authenticate, async (req, res) => {
    try {
        const { products, shippingAddress } = req.body;

        if (!products || products.length === 0) {
            return res.status(400).send({ message: "No products to buy" });
        }

        let orderProducts = [];
        let totalAmount = 0;

        for (let item of products) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(404).send({ message: `Product not found: ${item.productId}` });
            }
            if (product.quantity < item.quantity) {
                return res.status(400).send({ message: `Insufficient stock for ${product.name}` });
            }

            orderProducts.push({
                productId: product._id,
                name: product.name,
                price: product.price,
                quantity: item.quantity
            });

            totalAmount += product.price * item.quantity;

            await Product.findByIdAndUpdate(product._id, {
                quantity: product.quantity - item.quantity
            });
        }

        const order = new Order({
            userId: req.user._id,
            products: orderProducts,
            totalAmount,
            shippingAddress
        });

        await order.save();
        res.status(201).send({ message: "Order placed successfully", order });
    } catch (error) {
        res.status(400).send({ message: "Error placing order", error: error.message });
    }
});

/**
 * @swagger
 * /api/user/orders:
 *   get:
 *     summary: Get all orders for logged-in user
 *     tags: [User Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user orders
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/orders', authenticate, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.status(200).send({ count: orders.length, orders });
    } catch (error) {
        res.status(500).send({ message: "Error fetching orders", error: error.message });
    }
});

/**
 * @swagger
 * /api/user/order/{id}:
 *   get:
 *     summary: Get a specific order by ID
 *     tags: [User Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details
 *       404:
 *         description: Order not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/order/:id', authenticate, async (req, res) => {
    try {
        const order = await Order.findOne({ _id: req.params.id, userId: req.user._id });
        if (!order) {
            return res.status(404).send({ message: "Order not found" });
        }
        res.status(200).send(order);
    } catch (error) {
        res.status(500).send({ message: "Error fetching order", error: error.message });
    }
});

/**
 * @swagger
 * /api/user/order/{id}/cancel:
 *   put:
 *     summary: Cancel an order
 *     tags: [User Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *       400:
 *         description: Order already processed
 *       404:
 *         description: Order not found
 *       401:
 *         description: Unauthorized
 */
router.put('/order/:id/cancel', authenticate, async (req, res) => {
    try {
        const order = await Order.findOne({ _id: req.params.id, userId: req.user._id });
        if (!order) {
            return res.status(404).send({ message: "Order not found" });
        }
        if (order.status !== 'pending') {
            return res.status(400).send({ message: "Cannot cancel order. Order already processed." });
        }

        for (let item of order.products) {
            await Product.findByIdAndUpdate(item.productId, {
                $inc: { quantity: item.quantity }
            });
        }

        order.status = 'cancelled';
        await order.save();
        res.status(200).send({ message: "Order cancelled successfully", order });
    } catch (error) {
        res.status(400).send({ message: "Error cancelling order", error: error.message });
    }
});

module.exports = router;