const jwt = require('jsonwebtoken');
const User = require('../models/user');

const logger = (req, res, next) => {
    console.log(`${req.method} - ${req.url}`);
    next();
};

const authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).send({ message: "Access denied. No token provided." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        
        if (!user) {
            return res.status(401).send({ message: "Invalid token. User not found." });
        }

        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        res.status(401).send({ message: "Invalid token.", error: error.message });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).send({ message: "Access denied. Admin only." });
    }
    next();
};

const isAdminOrSeller = (req, res, next) => {
    if (req.user.role !== 'admin' && req.user.role !== 'seller') {
        return res.status(403).send({ message: "Access denied. Admin or Seller only." });
    }
    next();
};

const isUser = (req, res, next) => {
    if (req.user.role !== 'user') {
        return res.status(403).send({ message: "Access denied. User only." });
    }
    next();
};

module.exports = { logger, authenticate, isAdmin, isAdminOrSeller, isUser };
