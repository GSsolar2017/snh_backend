const graphService =
require('../services/graph.service');

exports.getEnergySourceGraph =
async (req, res) => {

   try {

      const data =
         await graphService
         .getEnergySourceGraph(
            req.params.siteId,
            req.query.date
         );

      res.json(data);

   } catch (err) {

      res.status(500).json({
         error: err.message
      });

   }

};

exports.getInverterGraph =
async (req, res) => {

   try {

      const data =
         await graphService
         .getInverterGraph(
            req.params.siteId,
            req.query.date
         );

      res.json(data);

   } catch (err) {

      res.status(500).json({
         error: err.message
      });

   }

};

exports.getImportExportGraph =
async (req, res) => {

   try {

      const data =
         await graphService
         .getImportExportGraph(
            req.params.siteId,
            req.query.date
         );

      res.json(data);

   } catch (err) {

      res.status(500).json({
         error: err.message
      });

   }

};

exports.getSolarGenerationGraph =
async (req, res) => {

   try {

      const data =
         await graphService
         .getSolarGenerationGraph(
            req.params.siteId,
            req.query.date
         );

      res.json(data);

   } catch (err) {

      res.status(500).json({
         error: err.message
      });

   }

};