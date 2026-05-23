const {
   getLatestPayload,
   getDayStartPayload
} = require(
   "../services/data.service"
);

const helpers =
require(
   "../helpers/dashboard.helper"
);



exports.getDashboardData =
async (req, res) => {

   try {

      const { siteId } =
      req.params;



      const latest =
      await getLatestPayload(
         siteId
      );



      const startDay =
      await getDayStartPayload(
         siteId
      );



      if (!latest) {

         return res.status(404)
         .json({

            success: false,

            message:
            "No data found"
         });
      }



      const inverters =
      helpers.parseData(
         latest.inverters || {}
      );



      const meters =
      helpers.parseData(
         latest.meters || {}
      );



      const startInverters =
      helpers.parseData(
         startDay?.inverters || {}
      );



      const startMeters =
      helpers.parseData(
         startDay?.meters || {}
      );



      /* LIVE VALUES */

      const solarLive =
      helpers.getSolarLive(
         inverters
      );



      const gridLive =
      helpers.getGridLive(
         meters
      );



      const dgLive =
      helpers.getDGTotal(
         meters
      );



      const plantLoad =
      helpers.getPlantLoad(

         solarLive,
         gridLive,
         dgLive
      );



      /* COUNTS */

      const inverterCount =
      helpers.getInverterCount(
         inverters
      );



      const meterCount =
      helpers.getMeterCount(
         meters
      );



      /* ENERGY */

      const latestSolar =
      helpers.getSolarTotal(
         inverters
      );



      const startSolar =
      helpers.getSolarTotal(
         startInverters
      );



      const solarGenerationToday =
      Number(

         (
            latestSolar -
            startSolar

         ).toFixed(2)
      );



      /* GRID IMPORT */

      const latestImport =
      helpers.getGridImport(
         meters
      );



      const startImport =
      helpers.getGridImport(
         startMeters
      );



      const gridImportToday =
      Number(

         (
            latestImport -
            startImport

         ).toFixed(2)
      );



      /* GRID EXPORT */

      const latestExport =
      helpers.getGridExport(
         meters
      );



      const startExport =
      helpers.getGridExport(
         startMeters
      );



      const gridExportToday =
      Number(

         (
            latestExport -
            startExport

         ).toFixed(2)
      );



      return res.json({

         success: true,

         cards: {

            solarLive,

            gridLive,

            dgLive,

            plantLoad,

            inverterCount,

            meterCount,

            solarGenerationToday,

            gridImportToday,

            gridExportToday
         },

         timestamp:
         latest.timestamp
      });

   }

   catch (err) {

      console.error(err);

      return res.status(500)
      .json({

         success: false,

         message:
         err.message
      });
   }
};