// Middleware to protect routes that require user authentication
// This middleware checks if a user is logged in before allowing access to protected routes

const authMiddleware = (req, res, next) => {
  // Check if user session exists and has userId
  if (!req.session.userId) {
    // User is not logged in, redirect to login page
    req.flash('error', 'Please login first');
    return res.redirect('/login');
  }

  // User is authenticated, proceed to next middleware/controller
  next();
};

module.exports = authMiddleware;
