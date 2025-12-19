const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Product = require('../models/product');
const Order = require('../models/order');
const { authenticate, isAdmin } = require('../middleware/auth');

/**
 * @swagger
 * /api/admin/login:
 *   post:
 *     summary: Admin login and get JWT token
 *     tags: [Admin Auth]
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
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 example: adminpassword
 *     responses:
 *       200:
 *         description: Admin login successful
 *       400:
 *         description: Invalid admin credentials
 *       500:
 *         description: Server error
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const admin = await User.findOne({ email, role: 'admin' });
        if (!admin) {
            return res.status(400).send({ message: "Invalid admin credentials" });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).send({ message: "Invalid admin credentials" });
        }

        const token = jwt.sign({ userId: admin._id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: '24h' });

        res.status(200).send({ 
            message: "Admin login successful", 
            token, 
            admin: { name: admin.name, email: admin.email, role: admin.role } 
        });
    } catch (error) {
        res.status(500).send({ message: "Error logging in", error: error.message });
    }
});

/**
 * @swagger
 * /api/admin/create:
 *   post:
 *     summary: Create a new admin user
 *     tags: [Admin Auth]
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
 *                 example: Admin User
 *               email:
 *                 type: string
 *                 example: newadmin@example.com
 *               password:
 *                 type: string
 *                 example: adminpassword
 *     responses:
 *       201:
 *         description: Admin created successfully
 *       400:
 *         description: Admin already exists or validation error
 */
router.post('/create', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingAdmin = await User.findOne({ email });
        if (existingAdmin) {
            return res.status(400).send({ message: "Admin already exists with this email" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const admin = new User({
            name,
            email,
            password: hashedPassword,
            role: 'admin'
        });

        await admin.save();
        res.status(201).send({ message: "Admin created successfully", admin: { name: admin.name, email: admin.email, role: admin.role } });
    } catch (error) {
        res.status(400).send({ message: "Error creating admin", error: error.message });
    }
});

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Admin Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Server error
 */
router.get('/users', authenticate, isAdmin, async (req, res) => {
    try {
        const users = await User.find({ role: 'user' }).select('-password');
        res.status(200).send({ count: users.length, users });
    } catch (error) {
        res.status(500).send({ message: "Error fetching users", error: error.message });
    }
});

/**
 * @swagger
 * /api/admin/sellers:
 *   get:
 *     summary: Get all sellers (Admin only)
 *     tags: [Admin Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all sellers
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Server error
 */
router.get('/sellers', authenticate, isAdmin, async (req, res) => {
    try {
        const sellers = await User.find({ role: 'seller' }).select('-password');
        res.status(200).send({ count: sellers.length, sellers });
    } catch (error) {
        res.status(500).send({ message: "Error fetching sellers", error: error.message });
    }
});

/**
 * @swagger
 * /api/admin/user/{id}:
 *   get:
 *     summary: Get user by ID (Admin only)
 *     tags: [Admin Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get('/user/:id', authenticate, isAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }
        res.status(200).send(user);
    } catch (error) {
        res.status(500).send({ message: "Error fetching user", error: error.message });
    }
});

/**
 * @swagger
 * /api/admin/user/{id}:
 *   delete:
 *     summary: Delete user by ID (Admin only)
 *     tags: [Admin Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.delete('/user/:id', authenticate, isAdmin, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }
        res.status(200).send({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).send({ message: "Error deleting user", error: error.message });
    }
});

/**
 * @swagger
 * /api/admin/user/{id}/role:
 *   put:
 *     summary: Update user role (Admin only)
 *     tags: [Admin Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [admin, user, seller]
 *     responses:
 *       200:
 *         description: User role updated successfully
 *       400:
 *         description: Invalid role
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.put('/user/:id/role', authenticate, isAdmin, async (req, res) => {
    try {
        const { role } = req.body;
        
        if (!['admin', 'user', 'seller'].includes(role)) {
            return res.status(400).send({ message: "Invalid role. Must be admin, user, or seller" });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id, 
            { role }, 
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        res.status(200).send({ message: "User role updated successfully", user });
    } catch (error) {
        res.status(400).send({ message: "Error updating user role", error: error.message });
    }
});

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Get admin dashboard statistics (Admin only)
 *     tags: [Admin Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Server error
 */
router.get('/dashboard', authenticate, isAdmin, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'user' });
        const totalSellers = await User.countDocuments({ role: 'seller' });
        const totalAdmins = await User.countDocuments({ role: 'admin' });
        const totalProducts = await Product.countDocuments();

        res.status(200).send({
            stats: {
                totalUsers,
                totalSellers,
                totalAdmins,
                totalProducts
            }
        });
    } catch (error) {
        res.status(500).send({ message: "Error fetching dashboard stats", error: error.message });
    }
});

/**
 * @swagger
 * /api/admin/product/{id}:
 *   delete:
 *     summary: Delete product (Admin only)
 *     tags: [Admin Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.delete('/product/:id', authenticate, isAdmin, async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).send({ message: "Product not found" });
        }
        res.status(200).send({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).send({ message: "Error deleting product", error: error.message });
    }
});

/**
 * @swagger
 * /api/admin/product/{id}:
 *   put:
 *     summary: Update product (Admin only)
 *     tags: [Admin Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       404:
 *         description: Product not found
 *       400:
 *         description: Error updating product
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.put('/product/:id', authenticate, isAdmin, async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true }
        );
        if (!product) {
            return res.status(404).send({ message: "Product not found" });
        }
        res.status(200).send({ message: "Product updated successfully", product });
    } catch (error) {
        res.status(400).send({ message: "Error updating product", error: error.message });
    }
});

/**
 * @swagger
 * /api/admin/orders:
 *   get:
 *     summary: Get all orders (Admin only)
 *     tags: [Admin Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all orders
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Server error
 */
router.get('/orders', authenticate, isAdmin, async (req, res) => {
    try {
        const orders = await Order.find().populate('userId', 'name email').sort({ createdAt: -1 });
        res.status(200).send({ count: orders.length, orders });
    } catch (error) {
        res.status(500).send({ message: "Error fetching orders", error: error.message });
    }
});

/**
 * @swagger
 * /api/admin/order/{id}:
 *   get:
 *     summary: Get order by ID (Admin only)
 *     tags: [Admin Orders]
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
 *       403:
 *         description: Admin access required
 */
router.get('/order/:id', authenticate, isAdmin, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('userId', 'name email');
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
 * /api/admin/order/{id}/status:
 *   put:
 *     summary: Update order status (Admin only)
 *     tags: [Admin Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, shipped, delivered, cancelled]
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       400:
 *         description: Invalid status
 *       404:
 *         description: Order not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.put('/order/:id/status', authenticate, isAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].includes(status)) {
            return res.status(400).send({ message: "Invalid status" });
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!order) {
            return res.status(404).send({ message: "Order not found" });
        }

        res.status(200).send({ message: "Order status updated successfully", order });
    } catch (error) {
        res.status(400).send({ message: "Error updating order status", error: error.message });
    }
});

module.exports = router;
