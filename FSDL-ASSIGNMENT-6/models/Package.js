// Package model schema for travel packages
const mongoose = require('mongoose');

// Define the Package schema
const packageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  destination: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  duration: {
    type: String,
    default: 'Not specified'  // e.g., "7 Days / 6 Nights"
  },
  imageUrl: {
    type: String,
    default: 'https://via.placeholder.com/400x300?text=Travel+Package'
  },
  seats: {
    type: Number,
    default: 20,
    min: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create and export the Package model
module.exports = mongoose.model('Package', packageSchema);
