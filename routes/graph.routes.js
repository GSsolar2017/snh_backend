const express = require('express');
const router = express.Router();

const graphsController = require('../controllers/graph.controller');

// ENERGY SOURCE GRAPH
router.get(
  '/:siteId/energy-sources',
  graphsController.getEnergySourceGraph
);

// INVERTER GRAPH
router.get(
  '/:siteId/inverters',
  graphsController.getInverterGraph
);

// IMPORT EXPORT GRAPH
router.get(
  '/:siteId/import-export',
  graphsController.getImportExportGraph
);

// SOLAR GENERATION GRAPH
router.get(
  '/:siteId/solar-generation',
  graphsController.getSolarGenerationGraph
);

module.exports = router;