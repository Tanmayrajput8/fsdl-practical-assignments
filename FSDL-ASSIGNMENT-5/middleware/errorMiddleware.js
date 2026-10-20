const errorHandler = (err, req, res, next) => {
    // Log error with timestamp
    console.error(`[${new Date().toISOString()}] Error:`, err.message);
    console.error('Stack:', err.stack);
    
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Something went wrong. Please try again later.';
    let errors = [];
    
    // Mongoose Validation Error
    if (err.name === 'ValidationError') {
        statusCode = 400;
        errors = Object.values(err.errors).map(e => e.message);
        message = 'Validation failed';
    }
    
    // Mongoose CastError (Invalid ObjectId)
    if (err.name === 'CastError') {
        statusCode = 404;
        message = 'Record not found';
    }
    
    // MongoDB Duplicate Key Error
    if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyValue)[0];
        if (field === 'email') {
            message = 'This email is already registered';
        } else {
            message = `Duplicate value for ${field}`;
        }
    }
    
    // JWT Errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }
    
    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Session expired. Please login again.';
    }
    
    // Multer Errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        statusCode = 400;
        message = 'Image size must be under 2MB';
    }
    
    if (err.code === 'LIMIT_FILE_COUNT') {
        statusCode = 400;
        message = 'Maximum 5 images allowed';
    }
    
    if (err.message === 'Only JPEG, PNG, and WEBP image files are allowed') {
        statusCode = 400;
        message = err.message;
    }
    
    // Check if request expects JSON
    if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(statusCode).json({
            success: false,
            message,
            errors: errors.length > 0 ? errors : undefined
        });
    }
    
    // Render error page for HTML requests
    if (req.flash) {
        req.flash('error', message);
    }
    
    res.status(statusCode).render('error', {
        title: 'Error',
        message,
        errors,
        statusCode,
        user: req.user || null
    });
};

// 404 Handler
const notFound = (req, res, next) => {
    res.status(404).render('error', {
        title: 'Page Not Found',
        message: 'The page you are looking for does not exist.',
        statusCode: 404,
        errors: [],
        user: req.user || null
    });
};

module.exports = { errorHandler, notFound };