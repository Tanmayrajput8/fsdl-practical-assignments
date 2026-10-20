const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect } = require('../middleware/authMiddleware');
const {
    getDashboard,
    getProfile,
    postUpdateProfile
} = require('../controllers/userController');

// Validation rules for profile update
const profileValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 3, max: 50 }).withMessage('Name must be between 3 and 50 characters')
        .escape(),
    
    body('phone')
        .trim()
        .notEmpty().withMessage('Phone number is required')
        .matches(/^[6-9]\d{9}$/).withMessage('Enter a valid 10-digit Indian mobile number'),
    
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

// Routes
router.get('/dashboard', protect, getDashboard);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, profileValidation, postUpdateProfile);

module.exports = router;