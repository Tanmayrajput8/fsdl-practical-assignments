const { validationResult } = require('express-validator');
const User = require('../models/user');
const Product = require('../models/Product');

// @desc    Get user dashboard
// @route   GET /user/dashboard
const getDashboard = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }
        
        // Get user's products
        const products = await Product.find({ seller: req.user.id })
            .sort({ createdAt: -1 });
        
        // Calculate stats
        const stats = {
            total: products.length,
            active: products.filter(p => p.status === 'available').length,
            sold: products.filter(p => p.status === 'sold').length,
            pending: products.filter(p => p.status === 'pending').length,
            totalViews: products.reduce((sum, p) => sum + p.views, 0)
        };
        
        res.render('dashboard', {
            title: 'Dashboard',
            user: req.user,
            userData: user,
            products,
            stats
        });
        
    } catch (error) {
        next(error);
    }
};

// @desc    Get user profile
// @route   GET /user/profile
const getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }
        
        res.render('profile', {
            title: 'Profile',
            user: req.user,
            userData: user,
            errors: []
        });
        
    } catch (error) {
        next(error);
    }
};

// @desc    Update user profile
// @route   PUT /user/profile
const postUpdateProfile = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        const user = await User.findById(req.user.id);
        
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }
        
        if (!errors.isEmpty()) {
            return res.render('profile', {
                title: 'Profile',
                user: req.user,
                userData: user,
                errors: errors.array()
            });
        }
        
        const { name, phone, city, state, pincode } = req.body;
        
        // Update fields (email cannot be changed)
        user.name = name;
        user.phone = phone;
        user.address = { city, state, pincode };
        
        await user.save();
        
        // Update req.user
        req.user.name = user.name;
        
        req.flash('success', 'Profile updated successfully!');
        res.redirect('/user/profile');
        
    } catch (error) {
        if (error.name === 'ValidationError') {
            const user = await User.findById(req.user.id);
            const validationErrors = Object.values(error.errors).map(e => ({
                path: e.path,
                msg: e.message
            }));
            
            return res.render('profile', {
                title: 'Profile',
                user: req.user,
                userData: user,
                errors: validationErrors
            });
        }
        
        next(error);
    }
};

module.exports = {
    getDashboard,
    getProfile,
    postUpdateProfile
};