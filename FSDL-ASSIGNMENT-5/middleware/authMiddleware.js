const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Protect routes - check if user is logged in
const protect = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        
        if (!token) {
            req.flash('error', 'Please login to continue.');
            return res.redirect('/auth/login');
        }
        
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);
            
            if (!user) {
                req.flash('error', 'User not found. Please login again.');
                res.clearCookie('token');
                return res.redirect('/auth/login');
            }
            
            req.user = {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            };
            
            next();
        } catch (jwtError) {
            if (jwtError.name === 'TokenExpiredError') {
                req.flash('error', 'Session expired. Please login again.');
            } else if (jwtError.name === 'JsonWebTokenError') {
                req.flash('error', 'Invalid session. Please login again.');
            } else {
                req.flash('error', 'Authentication failed. Please login again.');
            }
            res.clearCookie('token');
            return res.redirect('/auth/login');
        }
    } catch (error) {
        next(error);
    }
};

// Check user role
const roleCheck = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            req.flash('error', 'Please login to continue.');
            return res.redirect('/auth/login');
        }
        
        if (!roles.includes(req.user.role)) {
            req.flash('error', 'Access denied. You do not have permission to perform this action.');
            return res.redirect('/user/dashboard');
        }
        
        next();
    };
};

// Optional auth - doesn't require login but attaches user if logged in
const optionalAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findById(decoded.id);
                
                if (user) {
                    req.user = {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role
                    };
                }
            } catch (error) {
                // Token is invalid but that's okay for optional auth
                res.clearCookie('token');
            }
        }
        
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = { protect, roleCheck, optionalAuth };