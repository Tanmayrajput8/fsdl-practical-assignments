// Booking controller - handles user booking operations
const Booking = require('../models/Booking');
const Package = require('../models/Package');

// POST: Create a new booking for a package
const bookPackage = async (req, res) => {
  try {
    // Extract booking data from request body
    const { packageId, travelers } = req.body;
    const userId = req.session.userId;

    // Validate that travelers number is provided and valid
    if (!travelers || travelers < 1) {
      req.flash('error', 'Invalid number of travelers');
      return res.redirect(`/packages/${packageId}`);
    }

    // Find the package by ID
    const pkg = await Package.findById(packageId);
    if (!pkg) {
      req.flash('error', 'Package not found');
      return res.redirect('/packages');
    }

    // Check if enough seats are available for the booking
    if (pkg.seats < travelers) {
      req.flash('error', 'Not enough seats available for this booking');
      return res.redirect(`/packages/${packageId}`);
    }

    // Calculate total price (package price * number of travelers)
    const totalPrice = pkg.price * travelers;

    // Create new booking record
    const newBooking = new Booking({
      user: userId,
      package: packageId,
      travelers,
      totalPrice,
      status: 'Pending'
    });

    // Save booking to database
    await newBooking.save();

    // Show success message and redirect to booking history
    req.flash('success', 'Booking successful! Your booking status is Pending.');
    res.redirect('/bookings/history');
  } catch (error) {
    console.error('Error creating booking:', error);
    req.flash('error', 'An error occurred while creating booking');
    res.status(500).render('404', { message: 'Error creating booking' });
  }
};

// GET: Display user's booking history
const getBookingHistory = async (req, res) => {
  try {
    // Find all bookings for the logged-in user, populated with package details
    const bookings = await Booking.find({ user: req.session.userId })
      .populate('package')
      .sort({ bookedAt: -1 });

    // Render booking history page
    res.render('bookings/history', { bookings });
  } catch (error) {
    console.error('Error fetching booking history:', error);
    req.flash('error', 'Error loading booking history');
    res.status(500).render('404', { message: 'Error loading booking history' });
  }
};

// Export controller methods
module.exports = {
  bookPackage,
  getBookingHistory
};
