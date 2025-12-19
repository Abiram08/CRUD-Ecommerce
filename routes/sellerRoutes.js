const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Product = require('../models/product');
const { authenticate, isAdminOrSeller } = require('../middleware/auth');

/**
 * @swagger
 * /api/seller/register:
 *   post:
 *     summary: Register a new seller
 *     tags: [Seller Auth]
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
 *                 example: Seller Name
 *               email:
 *                 type: string
 *                 example: seller@example.com
 *               password:
 *                 type: string
 *                 example: sellerpassword
 *     responses:
 *       201:
 *         description: Seller registered successfully
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

        const seller = new User({
            name,
            email,
            password: hashedPassword,
            role: 'seller'
        });

        await seller.save();
        res.status(201).send({ message: "Seller registered successfully", seller: { name: seller.name, email: seller.email, role: seller.role } });
    } catch (error) {
        res.status(400).send({ message: "Error registering seller", error: error.message });
    }
});

/**
 * @swagger
 * /api/seller/login:
 *   post:
 *     summary: Seller login and get JWT token
 *     tags: [Seller Auth]
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
 *                 example: seller@example.com
 *               password:
 *                 type: string
 *                 example: sellerpassword
 *     responses:
 *       200:
 *         description: Seller login successful
 *       400:
 *         description: Invalid seller credentials
 *       500:
 *         description: Server error
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const seller = await User.findOne({ email, role: 'seller' });
        if (!seller) {
            return res.status(400).send({ message: "Invalid seller credentials" });
        }

        const isMatch = await bcrypt.compare(password, seller.password);
        if (!isMatch) {
            return res.status(400).send({ message: "Invalid seller credentials" });
        }

        const token = jwt.sign({ userId: seller._id, role: seller.role }, process.env.JWT_SECRET, { expiresIn: '24h' });

        res.status(200).send({ 
            message: "Seller login successful", 
            token, 
            seller: { name: seller.name, email: seller.email, role: seller.role } 
        });
    } catch (error) {
        res.status(500).send({ message: "Error logging in", error: error.message });
    }
});

/**
 * @swagger
 * /api/seller/profile:
 *   get:
 *     summary: Get seller profile
 *     tags: [Seller Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Seller profile data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Seller/Admin access required
 *       500:
 *         description: Server error
 */
router.get('/profile', authenticate, isAdminOrSeller, async (req, res) => {
    try {
        res.status(200).send({ 
            seller: { 
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
 * /api/seller/profile:
 *   put:
 *     summary: Update seller profile
 *     tags: [Seller Profile]
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
 *       403:
 *         description: Seller/Admin access required
 */
router.put('/profile', authenticate, isAdminOrSeller, async (req, res) => {
    try {
        const { name, email } = req.body;
        
        const seller = await User.findByIdAndUpdate(
            req.user._id, 
            { name, email }, 
            { new: true }
        );

        res.status(200).send({ 
            message: "Profile updated successfully", 
            seller: { name: seller.name, email: seller.email, role: seller.role } 
        });
    } catch (error) {
        res.status(400).send({ message: "Error updating profile", error: error.message });
    }
});

/**
 * @swagger
 * /api/seller/addproduct:
 *   post:
 *     summary: Add a new product (Seller)
 *     tags: [Seller Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Product added successfully
 *       400:
 *         description: Error adding product
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Seller/Admin access required
 */
router.post('/addproduct', authenticate, isAdminOrSeller, async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).send({ message: "Product added successfully", product });
    } catch (error) {
        res.status(400).send({ message: "Error adding product", error: error.message });
    }
});

/**
 * @swagger
 * /api/seller/myproducts:
 *   get:
 *     summary: Get all products (Seller)
 *     tags: [Seller Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of products
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Seller/Admin access required
 *       500:
 *         description: Server error
 */
router.get('/myproducts', authenticate, isAdminOrSeller, async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).send({ count: products.length, products });
    } catch (error) {
        res.status(500).send({ message: "Error fetching products", error: error.message });
    }
});

/**
 * @swagger
 * /api/seller/product/{id}:
 *   put:
 *     summary: Update product (Seller)
 *     tags: [Seller Products]
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
 *         description: Seller/Admin access required
 */
router.put('/product/:id', authenticate, isAdminOrSeller, async (req, res) => {
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

module.exports = router;
