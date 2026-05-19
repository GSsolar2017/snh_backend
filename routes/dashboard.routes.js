const express = require('express');
const router = express.Router();

const dashboardController =
require('../controllers/dashboard.controller');

router.get(
  '/:siteId/dashboard',
  dashboardController.getDashboard
);

module.exports = router;