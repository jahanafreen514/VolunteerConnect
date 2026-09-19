require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected for seeding...');

        const adminEmail = process.env.ADMIN_EMAIL || 'admin@volunteerconnect.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';

        const existingAdmin = await User.findOne({ email: adminEmail });
        if (existingAdmin) {
            console.log('Admin user already exists');
            process.exit(0);
        }

        const admin = await User.create({
            name: 'System Admin',
            email: adminEmail,
            password: adminPassword,
            role: 'admin'
        });

        console.log(`Admin user created: ${admin.email}`);
        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
