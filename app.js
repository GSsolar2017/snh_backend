require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

/* =========================
   MIDDLEWARE
========================= */

app.use(cors({
   origin: '*'
}));

app.use(helmet());

app.use(morgan('dev'));

app.use(express.json());

/* =========================
   ROUTES
========================= */

const testRoutes =
require('./routes/test.routes');

const authRoutes =
require('./routes/auth.routes');

const liveRoutes =
require('./routes/live.routes');

const dashboardRoutes =
require('./routes/dashboard.routes');

const graphRoutes =
require('./routes/graph.routes');

/* TEST */

app.use(
   '/api/test',
   testRoutes
);

/* AUTH */

app.use(
   '/api',
   authRoutes
);

/* LIVE + GRAPHS */

app.use(
   '/api/site',
   liveRoutes
);

/* DASHBOARD */

app.use(
   '/api',
   dashboardRoutes
);

app.use(
   '/api/graphs',
   graphRoutes
);

/* =========================
   HEALTH CHECK
========================= */

app.get('/', (req, res) => {

   res.json({

      success: true,

      message: 'Backend Running'

   });

});

/* =========================
   ERROR HANDLING
========================= */

process.on(
   'uncaughtException',
   err => {

      console.log(
         'UNCAUGHT EXCEPTION:',
         err
      );

   }
);

process.on(
   'unhandledRejection',
   err => {

      console.log(
         'UNHANDLED REJECTION:',
         err
      );

   }
);

module.exports = app;