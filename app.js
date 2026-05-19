require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();


app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

app.use(express.json());
const testRoutes = require('./routes/test.routes');
app.use('/api/test', testRoutes);

const liveRoutes =
require('./routes/live.routes');
app.use('/api/site', liveRoutes);

const dashboardRoutes =
require('./routes/dashboard.routes');
app.use('/api/dashboard', dashboardRoutes);

process.on('uncaughtException', err => {
  console.log(err);
});

process.on('unhandledRejection', err => {
  console.log(err);
});

module.exports = app;