// Booking routes - protected routes for authenticated users
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middleware/authMiddleware');

// POST: Book a package (requires authentication)
router.post('/bookings/book', authMiddleware, bookingController.bookPackage);

// GET: View user's booking history (requires authentication)
router.get('/bookings/history', authMiddleware, bookingController.getBookingHistory);

module.exports = router;
