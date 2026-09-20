require('express-async-errors');
require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { Server } = require('socket.io');

const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

const allowedOrigins = process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(',').map(url => url.trim().replace(/\/$/, ''))
    : ['http://localhost:5173', 'http://localhost:3000', 'https://volunteer-connect-omega-ten.vercel.app'];

const isOriginAllowed = (origin, callback) => {
    if (!origin) return callback(null, true);
    const cleanOrigin = origin.replace(/\/$/, '');
    if (allowedOrigins.includes('*') || 
        allowedOrigins.includes(cleanOrigin) || 
        cleanOrigin.endsWith('.onrender.com') || 
        cleanOrigin.endsWith('.vercel.app')) {
        return callback(null, true);
    }
    return callback(null, true); // Permissive fallback for deployment environments
};

// Socket.io setup
const io = new Server(server, {
    cors: {
        origin: isOriginAllowed,
        credentials: true
    }
});

// Set global io for controllers/utils to access
global.io = io;
app.set('io', io);

io.on('connection', (socket) => {
    console.log('New client connected', socket.id);
    
    // User joins their own room to receive personal notifications
    socket.on('join', (userId) => {
        if(userId) {
            socket.join(userId.toString());
            console.log(`User ${userId} joined room`);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected', socket.id);
    });
});

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({
    origin: isOriginAllowed,
    credentials: true
}));
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Root & Health Check Routes
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: "VolunteerConnect API is running"
    });
});

const mongoose = require('mongoose');
app.get(['/health', '/api/health'], (req, res) => {
    const isDbConnected = mongoose.connection.readyState === 1;
    res.status(200).json({
        success: true,
        message: "VolunteerConnect API is running",
        database: isDbConnected ? "connected" : "disconnected"
    });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/opportunities', require('./routes/opportunities'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/ngos', require('./routes/ngos'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/certificates', require('./routes/certificates'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/location', require('./routes/location'));

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);

    // Initial background news detection sync
    const { processNewsAndSyncOpportunities } = require('./services/newsService');
    setTimeout(() => {
        processNewsAndSyncOpportunities().then(res => {
            console.log(`[NewsPipeline] Initial news sync completed: ${res.processedCount || 0} events.`);
        }).catch(err => console.warn('[NewsPipeline] Initial sync notice:', err.message));
    }, 5000);

    // Periodic sync every 30 minutes
    setInterval(() => {
        processNewsAndSyncOpportunities().catch(err => console.warn('[NewsPipeline] Sync error:', err.message));
    }, 30 * 60 * 1000);
});
