// Admin routes - protected routes for admin users only
const express = require('express');
const router = express.Router();
const adminMiddleware = require('../middleware/adminMiddleware');
const adminPackageController = require('../controllers/adminPackageController');
const adminBookingController = require('../controllers/adminBookingController');
const Package = require('../models/Package');
const Booking = require('../models/Booking');

// GET: Admin dashboard with overview stats
router.get('/admin', adminMiddleware, async (req, res) => {
  try {
    // Fetch total count of packages and bookings
    const totalPackages = await Package.countDocuments();
    const totalBookings = await Booking.countDocuments();

    // Render admin dashboard with stats
    res.render('admin/dashboard', {
      totalPackages,
      totalBookings
    });
  } catch (error) {
    console.error('Error loading admin dashboard:', error);
    req.flash('error', 'Error loading dashboard');
    res.status(500).render('404', { message: 'Error loading dashboard' });
  }
});

// ==================== PACKAGE MANAGEMENT ====================

// GET: List all packages
router.get('/admin/packages', adminMiddleware, adminPackageController.listPackages);

// GET: Display add new package form
router.get('/admin/packages/add', adminMiddleware, adminPackageController.getAddPackage);

// POST: Save new package to database
router.post('/admin/packages/add', adminMiddleware, adminPackageController.postAddPackage);

// GET: Display edit package form
router.get('/admin/packages/edit/:id', adminMiddleware, adminPackageController.getEditPackage);

// POST: Update package in database
router.post('/admin/packages/edit/:id', adminMiddleware, adminPackageController.postEditPackage);

// POST: Delete package from database
router.post('/admin/packages/delete/:id', adminMiddleware, adminPackageController.deletePackage);

// ==================== BOOKING MANAGEMENT ====================

// GET: List all bookings
router.get('/admin/bookings', adminMiddleware, adminBookingController.listBookings);

// POST: Update booking status
router.post('/admin/bookings/status/:id', adminMiddleware, adminBookingController.updateStatus);

module.exports = router;
