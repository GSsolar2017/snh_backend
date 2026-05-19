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

router.get(
   '/:siteId/live',
   liveController.getLiveData
);

router.get(
   '/:siteId/energy-summary',
   energyController.getEnergySummary
);

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