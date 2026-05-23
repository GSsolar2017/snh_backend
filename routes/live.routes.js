const express =
require('express');

const router =
express.Router();

const liveController =
require('../controllers/live.controller');

const energyController =
require('../controllers/energySummary.controller');

const graphController =
require('../controllers/graph.controller');

/* =========================
   LIVE DATA
========================= */

const dashboardController =
require('../controllers/dashboard.controller');

router.get(
   '/:siteId/live',
   dashboardController.getDashboardData
);

/* =========================
   ENERGY SUMMARY
========================= */

router.get(
   '/:siteId/energy-summary',
   energyController.getEnergySummary
);

/* =========================
   GRAPHS
========================= */

router.get(
   '/:siteId/graphs/energy-sources',
   graphController.getEnergySourceGraph
);

router.get(
   '/:siteId/graphs/inverters',
   graphController.getInverterGraph
);

router.get(
   '/:siteId/graphs/import-export',
   graphController.getImportExportGraph
);

router.get(
   '/:siteId/graphs/solar-generation',
   graphController.getSolarGenerationGraph
);

module.exports = router;