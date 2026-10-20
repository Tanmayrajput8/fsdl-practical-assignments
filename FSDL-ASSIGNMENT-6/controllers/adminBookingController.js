// Admin booking controller - handles booking management for admins
const Booking = require('../models/Booking');

// GET: Display all bookings with user and package details
const listBookings = async (req, res) => {
  try {
    // Fetch all bookings, populated with user and package data, sorted by newest first
    const bookings = await Booking.find()
      .populate('user')
      .populate('package')
      .sort({ bookedAt: -1 });

    // Render admin bookings list page
    res.render('admin/bookings/list', { bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    req.flash('error', 'Error loading bookings');
    res.status(500).render('404', { message: 'Error loading bookings' });
  }
};

// POST: Update booking status
const updateStatus = async (req, res) => {
  try {
    // Extract new status from request body
    const { status } = req.body;

    // Validate that status is provided
    if (!status) {
      req.flash('error', 'Status is required');
      return res.redirect('/admin/bookings');
    }

    // Find booking by ID and update status
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    // Check if booking was found
    if (!booking) {
      req.flash('error', 'Booking not found');
      return res.redirect('/admin/bookings');
    }

    // Show success message and redirect to bookings list
    req.flash('success', `Booking status updated to ${status}`);
    res.redirect('/admin/bookings');
  } catch (error) {
    console.error('Error updating booking status:', error);
    req.flash('error', 'An error occurred while updating booking status');
    res.status(500).render('404', { message: 'Error updating booking' });
  }
};

// Export controller methods
module.exports = {
  listBookings,
  updateStatus
};
