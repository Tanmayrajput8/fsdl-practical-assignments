// Middleware to protect admin routes
// This middleware checks if the user is logged in AND has admin role

const adminMiddleware = (req, res, next) => {
  // Check if user is authenticated and has admin role
  if (!req.session.userId || req.session.userRole !== 'admin') {
    // User is not authenticated or not an admin, deny access
    req.flash('error', 'Access denied. Admin privileges required.');
    return res.status(403).render('404', { message: 'Access Denied' });
  }

  // User is admin, proceed to next middleware/controller
  next();
};

module.exports = adminMiddleware;
