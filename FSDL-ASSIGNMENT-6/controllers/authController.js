// Authentication controller - handles user registration, login, and logout
const User = require('../models/User');

// GET: Display registration form
const getRegister = (req, res) => {
  try {
    res.render('auth/register');
  } catch (error) {
    console.error('Error rendering register page:', error);
    res.status(500).render('404', { message: 'Error loading registration page' });
  }
};

// POST: Handle user registration
const postRegister = async (req, res) => {
  try {
    // Extract form data
    const { name, email, password, confirmPassword } = req.body;

    // Validate that all fields are provided
    if (!name || !email || !password || !confirmPassword) {
      req.flash('error', 'All fields are required');
      return res.redirect('/register');
    }

    // Validate that passwords match
    if (password !== confirmPassword) {
      req.flash('error', 'Passwords do not match');
      return res.redirect('/register');
    }

    // Check if user with this email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      req.flash('error', 'Email already registered');
      return res.redirect('/register');
    }

    // Create new user (password will be hashed by User model pre-save middleware)
    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password,
      role: 'user'
    });

    // Save user to database
    await newUser.save();

    // Show success message and redirect to login
    req.flash('success', 'Registration successful! Please login.');
    res.redirect('/login');
  } catch (error) {
    console.error('Error during registration:', error);
    req.flash('error', 'An error occurred during registration');
    res.redirect('/register');
  }
};

// GET: Display login form
const getLogin = (req, res) => {
  try {
    res.render('auth/login');
  } catch (error) {
    console.error('Error rendering login page:', error);
    res.status(500).render('404', { message: 'Error loading login page' });
  }
};

// POST: Handle user login
const postLogin = async (req, res) => {
  try {
    // Extract form data
    const { email, password } = req.body;

    // Validate that email and password are provided
    if (!email || !password) {
      req.flash('error', 'Email and password are required');
      return res.redirect('/login');
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      req.flash('error', 'Invalid email or password');
      return res.redirect('/login');
    }

    // Compare provided password with stored hashed password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      req.flash('error', 'Invalid email or password');
      return res.redirect('/login');
    }

    // Set session data for authenticated user
    req.session.userId = user._id;
    req.session.userRole = user.role;
    req.session.userName = user.name;

    // Show success message
    req.flash('success', `Welcome back, ${user.name}!`);

    // Redirect based on user role
    if (user.role === 'admin') {
      res.redirect('/admin');
    } else {
      res.redirect('/');
    }
  } catch (error) {
    console.error('Error during login:', error);
    req.flash('error', 'An error occurred during login');
    res.redirect('/login');
  }
};

// GET: Handle user logout
const logout = (req, res) => {
  try {
    // Destroy session
    req.session.destroy((error) => {
      if (error) {
        console.error('Error destroying session:', error);
        req.flash('error', 'Error during logout');
        return res.redirect('/');
      }

      // Show success message and redirect to login
      req.flash('success', 'You have been logged out successfully');
      res.redirect('/login');
    });
  } catch (error) {
    console.error('Error during logout:', error);
    res.redirect('/');
  }
};

// Export controller methods
module.exports = {
  getRegister,
  postRegister,
  getLogin,
  postLogin,
  logout
};
