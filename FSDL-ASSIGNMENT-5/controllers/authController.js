const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

// @desc    Show register page
// @route   GET /auth/register
const getRegister = (req, res) => {
    res.render('auth/register', {
        title: 'Register',
        user: null,
        errors: [],
        formData: {}
    });
};

// @desc    Register new user
// @route   POST /auth/register
const postRegister = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            return res.render('auth/register', {
                title: 'Register',
                user: null,
                errors: errors.array(),
                formData: req.body
            });
        }
        
        const { name, email, password, phone, role, city, state, pincode } = req.body;
        
        // Check if email already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.render('auth/register', {
                title: 'Register',
                user: null,
                errors: [{ path: 'email', msg: 'This Gmail address is already registered.' }],
                formData: req.body
            });
        }
        
        // Create new user
        const user = new User({
            name,
            email: email.toLowerCase(),
            password,
            phone,
            role: role || 'buyer',
            address: {
                city,
                state,
                pincode
            }
        });
        
        await user.save();
        
        req.flash('success', 'Registration successful! Please login.');
        res.redirect('/auth/login');
        
    } catch (error) {
        if (error.code === 11000) {
            return res.render('auth/register', {
                title: 'Register',
                user: null,
                errors: [{ path: 'email', msg: 'This Gmail address is already registered.' }],
                formData: req.body
            });
        }
        
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(e => ({
                path: e.path,
                msg: e.message
            }));
            
            return res.render('auth/register', {
                title: 'Register',
                user: null,
                errors: validationErrors,
                formData: req.body
            });
        }
        
        next(error);
    }
};

// @desc    Show login page
// @route   GET /auth/login
const getLogin = (req, res) => {
    res.render('auth/login', {
        title: 'Login',
        user: null,
        errors: [],
        formData: {}
    });
};

// @desc    Login user
// @route   POST /auth/login
const postLogin = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            return res.render('auth/login', {
                title: 'Login',
                user: null,
                errors: errors.array(),
                formData: req.body
            });
        }
        
        const { email, password, rememberMe } = req.body;
        
        // Find user with password
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
        
        if (!user) {
            return res.render('auth/login', {
                title: 'Login',
                user: null,
                errors: [{ path: 'email', msg: 'No account found with this email address' }],
                formData: req.body
            });
        }
        
        // Check password
        const isMatch = await user.comparePassword(password);
        
        if (!isMatch) {
            return res.render('auth/login', {
                title: 'Login',
                user: null,
                errors: [{ path: 'password', msg: 'Incorrect password. Please try again.' }],
                formData: req.body
            });
        }
        
        // Generate JWT
        const token = jwt.sign(
            { id: user._id, name: user.name, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: rememberMe ? '30d' : '7d' }
        );
        
        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });
        
        req.flash('success', `Welcome back, ${user.name}!`);
        res.redirect('/user/dashboard');
        
    } catch (error) {
        next(error);
    }
};

// @desc    Logout user
// @route   GET /auth/logout
const logout = (req, res) => {
    res.clearCookie('token');
    req.flash('success', 'You have been logged out successfully.');
    res.redirect('/auth/login');
};

module.exports = {
    getRegister,
    postRegister,
    getLogin,
    postLogin,
    logout
};