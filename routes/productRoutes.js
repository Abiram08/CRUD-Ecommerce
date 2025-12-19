const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const { authenticate, isAdmin, isAdminOrSeller } = require('../middleware/auth');

/**
 * @swagger
 * /api/addproduct:
 *   post:
 *     summary: Add a new product (Admin/Seller only)
 *     tags: [Products]
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
 *         description: Admin/Seller access required
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
 * /api/viewproducts:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of all products
 *       500:
 *         description: Server error
 */
router.get('/viewproducts', async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).send({ count: products.length, products });
    } catch (error) {
        res.status(500).send({ message: "Error fetching products", error: error.message });
    }
});

/**
 * @swagger
 * /api/product/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product details
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.get('/product/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).send({ message: "Product not found" });
        }
        res.status(200).send(product);
    } catch (error) {
        res.status(500).send({ message: "Error fetching product", error: error.message });
    }
});

/**
 * @swagger
 * /api/search:
 *   get:
 *     summary: Search products with filters
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Product name (partial match)
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price
 *       - in: query
 *         name: color
 *         schema:
 *           type: string
 *         description: Product color
 *     responses:
 *       200:
 *         description: Filtered list of products
 *       500:
 *         description: Server error
 */
router.get('/search', async (req, res) => {
    try {
        const { name, minPrice, maxPrice, color } = req.query;
        let filter = {};

        if (name) {
            filter.name = { $regex: name, $options: 'i' };
        }
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }
        if (color) {
            filter.color = { $regex: color, $options: 'i' };
        }

        const products = await Product.find(filter);
        res.status(200).send({ count: products.length, products });
    } catch (error) {
        res.status(500).send({ message: "Error searching products", error: error.message });
    }
});

/**
 * @swagger
 * /api/product/{id}:
 *   put:
 *     summary: Update product (Admin/Seller only)
 *     tags: [Products]
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
 *         description: Admin/Seller access required
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

/**
 * @swagger
 * /api/product/{id}:
 *   delete:
 *     summary: Delete product (Admin only)
 *     tags: [Products]
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

module.exports = router;
