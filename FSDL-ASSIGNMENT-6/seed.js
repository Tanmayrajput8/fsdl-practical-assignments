// Seed script to populate database with initial data
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Package = require('./models/Package');

// Function to seed the database
const seedDB = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing users and packages
    await User.deleteMany({});
    await Package.deleteMany({});

    console.log('Cleared existing data');

    // Create admin user with bcrypt-hashed password
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await User.create({
      name: 'Admin',
      email: 'admin@travel.com',
      password: adminPassword,
      role: 'admin'
    });

    console.log(' Admin user created successfully');
    console.log('  Email: admin@travel.com');
    console.log('  Password: admin123');

    // Create sample travel packages
    const packages = [
      {
        title: 'Bali Bliss',
        destination: 'Bali, Indonesia',
        description: 'Experience the tropical paradise of Bali with stunning beaches, ancient temples, and vibrant culture. Includes accommodation in a luxury resort, daily guided tours to Ubud, Tanah Lot Temple, and Seminyak Beach. Enjoy spa treatments and traditional Balinese cuisine.',
        price: 1200,
        duration: '7 Days / 6 Nights',
        imageUrl: 'https://plus.unsplash.com/premium_photo-1677829177642-30def98b0963?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        seats: 20
      },
      {
        title: 'Paris Romance',
        destination: 'Paris, France',
        description: 'Fall in love with the City of Light! Visit the iconic Eiffel Tower, Louvre Museum, and Notre-Dame Cathedral. Enjoy romantic riverside walks along the Seine, savor authentic French cuisine at historic bistros, and explore charming neighborhoods like Montmartre and Le Marais.',
        price: 2500,
        duration: '5 Days / 4 Nights',
        imageUrl: 'https://images.unsplash.com/photo-1549144511-f099e773c147?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        seats: 15
      },
      {
        title: 'Maldives Escape',
        destination: 'Maldives',
        description: 'Discover the world\'s most beautiful tropical islands with crystal-clear waters and pristine beaches. Stay in an overwater bungalow, explore vibrant coral reefs with snorkeling and diving, and enjoy water sports. Perfect for honeymooners and beach lovers seeking ultimate relaxation and luxury.',
        price: 3200,
        duration: '6 Days / 5 Nights',
        imageUrl: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        seats: 10
      }
    ];

    // Save all packages to database
    await Package.create(packages);

    console.log(' Sample packages created successfully:');
    packages.forEach((pkg, idx) => {
      console.log(`  ${idx + 1}. ${pkg.title} - ${pkg.destination} ($${pkg.price})`);
    });

    console.log('\n Database seeding completed successfully!');
    console.log('\nYou can now login with:');
    console.log('  Email: admin@travel.com');
    console.log('  Password: admin123');

    // Close database connection and exit
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    // Log error and exit with failure code
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
};

// Run the seed function
seedDB();
