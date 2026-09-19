require('express-async-errors');
require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

const allowedOrigins = process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(',').map(url => url.trim().replace(/\/$/, ''))
    : ['http://localhost:5173', 'http://localhost:3000'];

const isOriginAllowed = (origin, callback) => {
    if (!origin) return callback(null, true);
    const cleanOrigin = origin.replace(/\/$/, '');
    if (allowedOrigins.includes('*') || allowedOrigins.includes(cleanOrigin) || cleanOrigin.endsWith('.onrender.com')) {
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
app.use(helmet());
app.use(cors({
    origin: isOriginAllowed,
    credentials: true
}));
app.use(morgan('dev'));

// Health Check Routes for Render / Cloud Monitors
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
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

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
