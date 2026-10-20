const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        minLength: [5, 'Title must be at least 5 characters'],
        maxLength: [100, 'Title cannot exceed 100 characters'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        minLength: [20, 'Description must be at least 20 characters'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [1, 'Price must be at least ₹1']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: {
            values: ['Car', 'Bike', 'Scooter', 'Bicycle', 'Truck', 'Other'],
            message: 'Invalid category selected'
        }
    },
    condition: {
        type: String,
        required: [true, 'Condition is required'],
        enum: {
            values: ['Like New', 'Good', 'Fair', 'Poor'],
            message: 'Invalid condition selected'
        }
    },
    brand: {
        type: String,
        required: [true, 'Brand is required'],
        trim: true
    },
    year: {
        type: Number,
        required: [true, 'Year is required'],
        min: [1990, 'Year must be 1990 or later'],
        max: [new Date().getFullYear(), `Year cannot exceed ${new Date().getFullYear()}`]
    },
    kmDriven: {
        type: Number,
        required: [true, 'Kilometers driven is required'],
        min: [0, 'KM driven cannot be negative']
    },
    fuelType: {
        type: String,
        enum: {
            values: ['Petrol', 'Diesel', 'Electric', 'CNG', 'Other', 'N/A'],
            message: 'Invalid fuel type selected'
        },
        default: 'Petrol'
    },
    images: {
        type: [String],
        validate: {
            validator: function(v) {
                return v.length <= 5;
            },
            message: 'Maximum 5 images allowed'
        }
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Seller is required']
    },
    location: {
        city: { type: String, trim: true },
        state: { type: String, trim: true }
    },
    status: {
        type: String,
        enum: ['available', 'sold', 'pending'],
        default: 'available'
    },
    views: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Indexes for better query performance
productSchema.index({ category: 1 });
productSchema.index({ status: 1 });
productSchema.index({ seller: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ title: 'text', brand: 'text' });

module.exports = mongoose.model('Product', productSchema);