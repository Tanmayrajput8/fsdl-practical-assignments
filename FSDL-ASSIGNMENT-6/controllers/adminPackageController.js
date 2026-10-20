// Admin package controller - handles package management for admins
const Package = require('../models/Package');

// GET: Display all packages in admin panel
const listPackages = async (req, res) => {
  try {
    // Fetch all packages sorted by newest first
    const packages = await Package.find().sort({ createdAt: -1 });

    // Render admin packages list page
    res.render('admin/packages/list', { packages });
  } catch (error) {
    console.error('Error fetching packages:', error);
    req.flash('error', 'Error loading packages');
    res.status(500).render('404', { message: 'Error loading packages' });
  }
};

// GET: Display add new package form
const getAddPackage = (req, res) => {
  try {
    res.render('admin/packages/add');
  } catch (error) {
    console.error('Error rendering add package form:', error);
    res.status(500).render('404', { message: 'Error loading form' });
  }
};

// POST: Create new package in database
const postAddPackage = async (req, res) => {
  try {
    // Extract package data from request body
    const { title, destination, description, price, duration, imageUrl, seats } = req.body;

    // Validate required fields
    if (!title || !destination || !description || !price) {
      req.flash('error', 'Title, destination, description, and price are required');
      return res.redirect('/admin/packages/add');
    }

    // Create new package record
    const newPackage = new Package({
      title,
      destination,
      description,
      price: Number(price),
      duration: duration || 'Not specified',
      imageUrl: imageUrl || 'https://via.placeholder.com/400x300?text=Travel+Package',
      seats: Number(seats) || 20
    });

    // Save package to database
    await newPackage.save();

    // Show success message and redirect to packages list
    req.flash('success', 'Package added successfully');
    res.redirect('/admin/packages');
  } catch (error) {
    console.error('Error adding package:', error);
    req.flash('error', 'An error occurred while adding package');
    res.status(500).render('404', { message: 'Error adding package' });
  }
};

// GET: Display edit package form with existing data
const getEditPackage = async (req, res) => {
  try {
    // Find package by ID
    const pkg = await Package.findById(req.params.id);

    // Check if package exists
    if (!pkg) {
      req.flash('error', 'Package not found');
      return res.redirect('/admin/packages');
    }

    // Render edit form with package data
    res.render('admin/packages/edit', { package: pkg });
  } catch (error) {
    console.error('Error fetching package:', error);
    req.flash('error', 'Error loading package');
    res.status(500).render('404', { message: 'Error loading package' });
  }
};

// POST: Update existing package in database
const postEditPackage = async (req, res) => {
  try {
    // Extract updated package data
    const { title, destination, description, price, duration, imageUrl, seats } = req.body;

    // Validate required fields
    if (!title || !destination || !description || !price) {
      req.flash('error', 'Title, destination, description, and price are required');
      return res.redirect(`/admin/packages/edit/${req.params.id}`);
    }

    // Update package with new data
    await Package.findByIdAndUpdate(req.params.id, {
      title,
      destination,
      description,
      price: Number(price),
      duration: duration || 'Not specified',
      imageUrl: imageUrl || 'https://via.placeholder.com/400x300?text=Travel+Package',
      seats: Number(seats) || 20
    });

    // Show success message and redirect to packages list
    req.flash('success', 'Package updated successfully');
    res.redirect('/admin/packages');
  } catch (error) {
    console.error('Error updating package:', error);
    req.flash('error', 'An error occurred while updating package');
    res.status(500).render('404', { message: 'Error updating package' });
  }
};

// POST: Delete package from database
const deletePackage = async (req, res) => {
  try {
    // Find and delete package by ID
    const pkg = await Package.findByIdAndDelete(req.params.id);

    // Check if package was found and deleted
    if (!pkg) {
      req.flash('error', 'Package not found');
      return res.redirect('/admin/packages');
    }

    // Show success message and redirect to packages list
    req.flash('success', 'Package deleted successfully');
    res.redirect('/admin/packages');
  } catch (error) {
    console.error('Error deleting package:', error);
    req.flash('error', 'An error occurred while deleting package');
    res.status(500).render('404', { message: 'Error deleting package' });
  }
};

// Export controller methods
module.exports = {
  listPackages,
  getAddPackage,
  postAddPackage,
  getEditPackage,
  postEditPackage,
  deletePackage
};
