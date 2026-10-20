const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const {
    getRegister,
    postRegister,
    getLogin,
    postLogin,
    logout
} = require('../controllers/authController');

// Rate limiter for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: 'Too many attempts. Please try again after 15 minutes.',
    handler: (req, res) => {
        req.flash('error', 'Too many attempts. Please try again after 15 minutes.');
        res.redirect('back');
    }
});

// Validation rules for registration
const registerValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 3, max: 50 }).withMessage('Name must be between 3 and 50 characters')
        .escape(),
    
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please enter a valid email address')
        .custom(value => {
            if (!value.endsWith('@gmail.com')) {
                throw new Error('Only Gmail addresses are allowed (e.g. name@gmail.com)');
            }
            return true;
        })
        .normalizeEmail(),
    
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
        .matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
        .withMessage('Password must include an uppercase letter, a number, and a special character (@$!%*?&)'),
    
    body('confirmPassword')
        .notEmpty().withMessage('Please confirm your password')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match');
            }
            return true;
        }),
    
    body('phone')
        .trim()
        .notEmpty().withMessage('Phone number is required')
        .matches(/^[6-9]\d{9}$/).withMessage('Enter a valid 10-digit Indian mobile number'),
    
    body('role')
        .optional()
        .isIn(['buyer', 'seller']).withMessage('Invalid role selected'),
    
    body('city')
        .optional()
        .trim()
        .escape(),
    
    body('state')
        .optional()
        .trim()
        .escape(),
    
    body('pincode')
        .optional()
        .trim()
        .escape()
];

// Validation rules for login
const loginValidation = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please enter a valid email address')
        .normalizeEmail(),
    
    body('password')
        .notEmpty().withMessage('Password is required')
];

// Routes
router.get('/register', getRegister);
router.post('/register', authLimiter, registerValidation, postRegister);

router.get('/login', getLogin);
router.post('/login', authLimiter, loginValidation, postLogin);

router.get('/logout', logout);

module.exports = router;