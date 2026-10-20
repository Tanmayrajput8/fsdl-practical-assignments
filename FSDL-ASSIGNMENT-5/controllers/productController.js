const { validationResult } = require('express-validator');
const Product = require('../models/Product');
const fs = require('fs');
const path = require('path');

// @desc    Get all products with search, filter, sort, pagination
// @route   GET /products
const getAllProducts = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 12;
        const skip = (page - 1) * limit;
        
        // Build query
        let query = { status: 'available' };
        
        // Search by title or brand
        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search, 'i');
            query.$or = [
                { title: searchRegex },
                { brand: searchRegex }
            ];
        }
        
        // Filter by category
        if (req.query.category) {
            const categories = Array.isArray(req.query.category) 
                ? req.query.category 
                : [req.query.category];
            query.category = { $in: categories };
        }
        
        // Filter by condition
        if (req.query.condition) {
            const conditions = Array.isArray(req.query.condition) 
                ? req.query.condition 
                : [req.query.condition];
            query.condition = { $in: conditions };
        }
        
        // Filter by fuel type
        if (req.query.fuelType) {
            const fuelTypes = Array.isArray(req.query.fuelType) 
                ? req.query.fuelType 
                : [req.query.fuelType];
            query.fuelType = { $in: fuelTypes };
        }
        
        // Filter by city
        if (req.query.city) {
            query['location.city'] = new RegExp(req.query.city, 'i');
        }
        
        // Filter by price range
        if (req.query.minPrice || req.query.maxPrice) {
            query.price = {};
            if (req.query.minPrice) {
                query.price.$gte = parseInt(req.query.minPrice);
            }
            if (req.query.maxPrice) {
                query.price.$lte = parseInt(req.query.maxPrice);
            }
        }
        
        // Sort options
        let sortOption = { createdAt: -1 }; // Default: newest first
        if (req.query.sort) {
            switch (req.query.sort) {
                case 'oldest':
                    sortOption = { createdAt: 1 };
                    break;
                case 'price_low':
                    sortOption = { price: 1 };
                    break;
                case 'price_high':
                    sortOption = { price: -1 };
                    break;
                case 'views':
                    sortOption = { views: -1 };
                    break;
            }
        }
        
        // Execute query
        const products = await Product.find(query)
            .populate('seller', 'name address.city')
            .sort(sortOption)
            .skip(skip)
            .limit(limit);
        
        // Get total count for pagination
        const totalProducts = await Product.countDocuments(query);
        const totalPages = Math.ceil(totalProducts / limit);
        
        res.render('products/index', {
            title: 'Browse Listings',
            products,
            currentPage: page,
            totalPages,
            totalProducts,
            query: req.query,
            user: req.user || null
        });
        
    } catch (error) {
        next(error);
    }
};

// @desc    Show create product form
// @route   GET /products/create
const getCreateForm = (req, res) => {
    res.render('products/create', {
        title: 'Post a Listing',
        user: req.user,
        errors: [],
        formData: {}
    });
};

// @desc    Create new product
// @route   POST /products/create
const postCreateProduct = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            // Delete uploaded files if validation fails
            if (req.files) {
                req.files.forEach(file => {
                    fs.unlink(file.path, err => {
                        if (err) console.error('Error deleting file:', err);
                    });
                });
            }
            
            return res.render('products/create', {
                title: 'Post a Listing',
                user: req.user,
                errors: errors.array(),
                formData: req.body
            });
        }
        
        const {
            title, description, price, category, condition,
            brand, year, kmDriven, fuelType, city, state
        } = req.body;
        
        // Get image paths
        const images = req.files ? req.files.map(file => '/uploads/' + file.filename) : [];
        
        const product = new Product({
            title,
            description,
            price: parseInt(price),
            category,
            condition,
            brand,
            year: parseInt(year),
            kmDriven: parseInt(kmDriven),
            fuelType: fuelType || 'Other',
            images,
            seller: req.user.id,
            location: { city, state }
        });
        
        await product.save();
        
        req.flash('success', 'Your listing has been posted successfully!');
        res.redirect('/products/' + product._id);
        
    } catch (error) {
        // Delete uploaded files on error
        if (req.files) {
            req.files.forEach(file => {
                fs.unlink(file.path, err => {
                    if (err) console.error('Error deleting file:', err);
                });
            });
        }
        
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(e => ({
                path: e.path,
                msg: e.message
            }));
            
            return res.render('products/create', {
                title: 'Post a Listing',
                user: req.user,
                errors: validationErrors,
                formData: req.body
            });
        }
        
        next(error);
    }
};

// @desc    Get product detail
// @route   GET /products/:id
const getProductDetail = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('seller', 'name phone address createdAt');
        
        if (!product) {
            const error = new Error('Product not found');
            error.statusCode = 404;
            throw error;
        }
        
        // Increment views
        product.views += 1;
        await product.save();
        
        // Get related products
        const relatedProducts = await Product.find({
            category: product.category,
            _id: { $ne: product._id },
            status: 'available'
        })
            .limit(4)
            .populate('seller', 'name address.city');
        
        res.render('products/detail', {
            title: product.title,
            product,
            relatedProducts,
            user: req.user || null,
            isOwner: req.user && product.seller._id.toString() === req.user.id.toString()
        });
        
    } catch (error) {
        next(error);
    }
};

// @desc    Show edit product form
// @route   GET /products/:id/edit
const getEditForm = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            const error = new Error('Product not found');
            error.statusCode = 404;
            throw error;
        }
        
        // Check ownership
        if (product.seller.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
            req.flash('error', 'Access denied. You can only edit your own listings.');
            return res.redirect('/products/' + req.params.id);
        }
        
        res.render('products/edit', {
            title: 'Edit Listing',
            product,
            user: req.user,
            errors: [],
            formData: product
        });
        
    } catch (error) {
        next(error);
    }
};

// @desc    Update product
// @route   PUT /products/:id
const postUpdateProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            const error = new Error('Product not found');
            error.statusCode = 404;
            throw error;
        }
        
        // Check ownership
        if (product.seller.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
            req.flash('error', 'Access denied. You can only edit your own listings.');
            return res.redirect('/products/' + req.params.id);
        }
        
        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            // Delete newly uploaded files if validation fails
            if (req.files) {
                req.files.forEach(file => {
                    fs.unlink(file.path, err => {
                        if (err) console.error('Error deleting file:', err);
                    });
                });
            }
            
            return res.render('products/edit', {
                title: 'Edit Listing',
                product,
                user: req.user,
                errors: errors.array(),
                formData: req.body
            });
        }
        
        const {
            title, description, price, category, condition,
            brand, year, kmDriven, fuelType, city, state, removeImages
        } = req.body;
        
        // Handle image removal
        if (removeImages) {
            const imagesToRemove = Array.isArray(removeImages) ? removeImages : [removeImages];
            imagesToRemove.forEach(img => {
                const filePath = path.join(__dirname, '../public', img);
                fs.unlink(filePath, err => {
                    if (err) console.error('Error deleting file:', err);
                });
            });
            product.images = product.images.filter(img => !imagesToRemove.includes(img));
        }
        
        // Add new images
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(file => '/uploads/' + file.filename);
            product.images = [...product.images, ...newImages].slice(0, 5);
        }
        
        // Update fields
        product.title = title;
        product.description = description;
        product.price = parseInt(price);
        product.category = category;
        product.condition = condition;
        product.brand = brand;
        product.year = parseInt(year);
        product.kmDriven = parseInt(kmDriven);
        product.fuelType = fuelType || 'Other';
        product.location = { city, state };
        
        await product.save();
        
        req.flash('success', 'Listing updated successfully!');
        res.redirect('/products/' + product._id);
        
    } catch (error) {
        // Delete uploaded files on error
        if (req.files) {
            req.files.forEach(file => {
                fs.unlink(file.path, err => {
                    if (err) console.error('Error deleting file:', err);
                });
            });
        }
        
        next(error);
    }
};

// @desc    Delete product
// @route   DELETE /products/:id
const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            const error = new Error('Product not found');
            error.statusCode = 404;
            throw error;
        }
        
        // Check ownership
        if (product.seller.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
            req.flash('error', 'Access denied. You can only delete your own listings.');
            return res.redirect('/products/' + req.params.id);
        }
        
        // Delete images from disk
        product.images.forEach(img => {
            const filePath = path.join(__dirname, '../public', img);
            fs.unlink(filePath, err => {
                if (err) console.error('Error deleting file:', err);
            });
        });
        
        await Product.findByIdAndDelete(req.params.id);
        
        req.flash('success', 'Listing deleted successfully!');
        res.redirect('/user/dashboard');
        
    } catch (error) {
        next(error);
    }
};

// @desc    Mark product as sold
// @route   POST /products/:id/mark-sold
const markSold = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            const error = new Error('Product not found');
            error.statusCode = 404;
            throw error;
        }
        
        // Check ownership
        if (product.seller.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
            req.flash('error', 'Access denied. You can only modify your own listings.');
            return res.redirect('/products/' + req.params.id);
        }
        
        product.status = 'sold';
        await product.save();
        
        req.flash('success', 'Listing marked as sold!');
        res.redirect('/products/' + product._id);
        
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllProducts,
    getCreateForm,
    postCreateProduct,
    getProductDetail,
    getEditForm,
    postUpdateProduct,
    deleteProduct,
    markSold
};