// Authentication routes - register, login, logout
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// GET: Display registration form
router.get('/register', authController.getRegister);

// POST: Handle user registration
router.post('/register', authController.postRegister);

// GET: Display login form
router.get('/login', authController.getLogin);

// POST: Handle user login
router.post('/login', authController.postLogin);

// GET: Handle user logout
router.get('/logout', authController.logout);

module.exports = router;
