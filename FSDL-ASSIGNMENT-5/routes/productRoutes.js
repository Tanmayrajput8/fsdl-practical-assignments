const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect, roleCheck, optionalAuth } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
    getAllProducts,
    getCreateForm,
    postCreateProduct,
    getProductDetail,
    getEditForm,
    postUpdateProduct,
    deleteProduct,
    markSold
} = require('../controllers/productController');

// Validation rules for product
const productValidation = [
    body('title')
        .trim()
        .notEmpty().withMessage('Title is required')
        .isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters')
        .escape(),
    
    body('description')
        .trim()
        .notEmpty().withMessage('Description is required')
        .isLength({ min: 20 }).withMessage('Description must be at least 20 characters'),
    
    body('price')
        .notEmpty().withMessage('Price is required')
        .isInt({ min: 1 }).withMessage('Price must be at least ₹1'),
    
    body('category')
        .notEmpty().withMessage('Category is required')
        .isIn(['Car', 'Bike', 'Scooter', 'Bicycle', 'Truck', 'Other'])
        .withMessage('Invalid category selected'),
    
    body('condition')
        .notEmpty().withMessage('Condition is required')
        .isIn(['Like New', 'Good', 'Fair', 'Poor'])
        .withMessage('Invalid condition selected'),
    
    body('brand')
        .trim()
        .notEmpty().withMessage('Brand is required')
        .escape(),
    
    body('year')
        .notEmpty().withMessage('Year is required')
        .isInt({ min: 1990, max: new Date().getFullYear() })
        .withMessage(`Year must be between 1990 and ${new Date().getFullYear()}`),
    
    body('kmDriven')
        .notEmpty().withMessage('Kilometers driven is required')
        .isInt({ min: 0 }).withMessage('KM driven cannot be negative'),
    
    body('fuelType')
        .optional()
        .isIn(['Petrol', 'Diesel', 'Electric', 'CNG', 'Other', 'N/A'])
        .withMessage('Invalid fuel type selected'),
    
    body('city')
        .optional()
        .trim()
        .escape(),
    
    body('state')
        .optional()
        .trim()
        .escape()
];

// Routes
router.get('/', optionalAuth, getAllProducts);

router.get('/create', protect, roleCheck('seller', 'admin'), getCreateForm);
router.post('/create', 
    protect, 
    roleCheck('seller', 'admin'), 
    upload.array('images', 5), 
    productValidation, 
    postCreateProduct
);

router.get('/:id', optionalAuth, getProductDetail);

router.get('/:id/edit', protect, getEditForm);
router.put('/:id', 
    protect, 
    upload.array('images', 5), 
    productValidation, 
    postUpdateProduct
);

router.delete('/:id', protect, deleteProduct);

router.post('/:id/mark-sold', protect, markSold);

module.exports = router;