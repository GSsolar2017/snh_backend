const energySummaryService =
require('../services/energySummary.service');

exports.getEnergySummary =
async (req, res) => {

   try {

      const data =
         await energySummaryService
         .getEnergySummary(
            req.params.siteId
         );

      res.json(data);

   } catch (err) {

      res.status(500).json({
         error: err.message
      });

   }

};