// Package routes - view packages, filter, and details
const express = require('express');
const router = express.Router();
const packageController = require('../controllers/packageController');

// GET: Display homepage with featured packages
router.get('/', packageController.getHomepage);

// GET: Display all packages with optional filtering
router.get('/packages', packageController.getAllPackages);

// GET: Display detailed information for a specific package
router.get('/packages/:id', packageController.getPackageDetail);

module.exports = router;
