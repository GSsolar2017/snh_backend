require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
// "start": "node server.js",
// CORS
app.use(cors({
  origin: '*'
}));
// Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Routes
const testRoutes = require('./routes/test.routes');
app.use('/api/test', testRoutes);

const liveRoutes = require('./routes/live.routes');
app.use('/api/site', liveRoutes);

const dashboardRoutes = require('./routes/dashboard.routes');
app.use('/api/dashboard', dashboardRoutes);

// Health check route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Backend is running'
  });
});

// Error handling
process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION:', err);
});

module.exports = app;