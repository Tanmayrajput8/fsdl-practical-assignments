// Package controller - handles user-facing package operations
const Package = require('../models/Package');

// GET: Display homepage with featured packages
const getHomepage = async (req, res) => {
  try {
    // Fetch the 3 most recently created packages for featured section
    const featuredPackages = await Package.find({})
      .sort({ createdAt: -1 })
      .limit(3);

    // Render homepage with featured packages
    res.render('index', { packages: featuredPackages });
  } catch (error) {
    console.error('Error fetching featured packages:', error);
    req.flash('error', 'Error loading homepage');
    res.status(500).render('404', { message: 'Error loading homepage' });
  }
};

// GET: Display all packages with optional filtering
const getAllPackages = async (req, res) => {
  try {
    // Build filter object from query parameters
    const filters = {};

    // If destination filter is provided, use regex for case-insensitive search
    if (req.query.destination && req.query.destination.trim()) {
      filters.destination = { $regex: req.query.destination, $options: 'i' };
    }

    // If max price filter is provided, filter packages with price <= maxPrice
    if (req.query.maxPrice && !isNaN(req.query.maxPrice)) {
      filters.price = { $lte: Number(req.query.maxPrice) };
    }

    // Fetch all packages matching the filters
    const packages = await Package.find(filters).sort({ createdAt: -1 });

    // Render packages page with filtered packages and preserve filter values
    res.render('packages/index', {
      packages,
      destination: req.query.destination || '',
      maxPrice: req.query.maxPrice || ''
    });
  } catch (error) {
    console.error('Error fetching packages:', error);
    req.flash('error', 'Error loading packages');
    res.status(500).render('404', { message: 'Error loading packages' });
  }
};

// GET: Display detailed information for a specific package
const getPackageDetail = async (req, res) => {
  try {
    // Find package by ID from URL parameter
    const pkg = await Package.findById(req.params.id);

    // Check if package exists
    if (!pkg) {
      req.flash('error', 'Package not found');
      return res.redirect('/packages');
    }

    // Render package detail page
    res.render('packages/detail', { package: pkg });
  } catch (error) {
    console.error('Error fetching package details:', error);
    req.flash('error', 'Error loading package details');
    res.status(500).render('404', { message: 'Error loading package' });
  }
};

// Export controller methods
module.exports = {
  getHomepage,
  getAllPackages,
  getPackageDetail
};
