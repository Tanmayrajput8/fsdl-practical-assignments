require('dotenv').config();

const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');

const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const packageRoutes = require('./routes/packageRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware: Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Middleware: Parse JSON data
app.use(express.json());

// Middleware: Static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, 'public')));

// Middleware: Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, 
    maxAge: 24 * 60 * 60 * 1000  
  }
}));

app.use(flash());

// Middleware: Set view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use((req, res, next) => {
  res.locals.session = req.session;
  res.locals.messages = {
    success: req.flash('success'),
    error: req.flash('error')
  };
  next();
});

// Routes: Auth routes (register, login, logout)
app.use('/', authRoutes);

// Routes: Package routes (view packages, filter, details)
app.use('/', packageRoutes);

// Routes: Booking routes (book packages, view history)
app.use('/', bookingRoutes);

// Routes: Admin routes (manage packages and bookings)
app.use('/', adminRoutes);

app.use((req, res) => {
  res.status(404).render('404');
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).render('404', { message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
