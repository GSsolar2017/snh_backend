const dynamoDB = require('../aws/dynamodb');

const {
   QueryCommand
} = require('@aws-sdk/lib-dynamodb');

const sites =
require('../constants/sites');

exports.getLiveData = async (siteId) => {

   const site = sites[siteId];

   // =========================
   // INVALID SITE
   // =========================

   if (!site) {

      return {

         success: false,

         message: 'Invalid Site'

      };

   }

   try {

      // =========================
      // GET LATEST ROW
      // =========================

      const params = {

         TableName: site.tableName,

         KeyConditionExpression:
            'deviceId = :deviceId AND #ts >= :start',

         ExpressionAttributeNames: {
            '#ts': 'timestamp'
         },

         ExpressionAttributeValues: {

            ':deviceId': site.deviceId,

            ':start': '2020-01-01T00:00:00.000Z'
         },

         ScanIndexForward: false,

         Limit: 1

      };

      const result =
         await dynamoDB.send(
            new QueryCommand(params)
         );

      // =========================
      // LOGGER OFFLINE
      // =========================

      if (!result.Items || !result.Items.length) {

         return {

            success: true,

            loggerOnline: false,

            siteName: site.siteName,

            timestamp: null,

            cards: {

               solarPlantLive: 0,
               gridLive: 0,
               dgLive: 0,
               plantLoad: 0,

               solarGenerationToday: 0,

               rsebImport: 0,
               rsebExport: 0,

               dg250Status: 'Offline',
               dg500_1_Status: 'Offline',
               dg500_2_Status: 'Offline',

               inverterCount: 0,
               meterCount: 0

            },

            inverters: {},
            meters: {},

            alerts: [
               'Logger Offline'
            ]

         };

      }

      const raw = result.Items[0];

      console.log(
         'LATEST ROW:',
         JSON.stringify(raw, null, 2)
      );

      // =========================
      // PARSE INVERTERS
      // =========================

      let inverterData = {};

      try {

         inverterData =
            typeof raw.inverters === 'string'
               ? JSON.parse(raw.inverters)
               : raw.inverters || {};

      } catch (err) {

         console.log(
            'Inverter Parse Error:',
            err.message
         );

         inverterData = {};
      }

      // =========================
      // PARSE METERS
      // =========================

      let meterData = {};

      try {

         meterData =
            typeof raw.meters === 'string'
               ? JSON.parse(raw.meters)
               : raw.meters || {};

      } catch (err) {

         console.log(
            'Meter Parse Error:',
            err.message
         );

         meterData = {};
      }

      const inverters =
         Object.entries(inverterData);

      const meters =
         Object.entries(meterData);

      // =========================
      // SOLAR LIVE
      // =========================

      const solarPlantLive =
         inverters.reduce((sum, [key, val]) => {

            return sum +
               (
                  Number(
                     val?.AC_Active_Power || 0
                  ) / 1000
               );

         }, 0);

      // =========================
      // SOLAR TODAY
      // =========================

      const solarGenerationToday =
         inverters.reduce((sum, [key, val]) => {

            return sum +
               Number(
                  val?.kWh_Day_Active || 0
               );

         }, 0);

      // =========================
      // GRID LIVE
      // =========================

      const gridLive =
         (
            Number(
               meterData?.meter_grid?.AC_Active_Power || 0
            )
         ) / 1000;

      // =========================
      // DG LIVE
      // =========================

      const dgLive =
         (
            Number(
               meterData?.meter_dg?.AC_Active_Power || 0
            ) +

            Number(
               meterData?.meter_dg58?.AC_Active_Power || 0
            )

         ) / 1000;

      // =========================
      // TOTAL LOAD
      // =========================

      const plantLoad =
         solarPlantLive +
         gridLive +
         dgLive;

      // =========================
      // ALERTS
      // =========================

      const alerts = [];

      // =========================
      // FINAL RESPONSE
      // =========================

      return {

         success: true,

         loggerOnline: true,

         siteName: site.siteName,

         timestamp: raw.timestamp,

         cards: {

            // =====================
            // LIVE POWER
            // =====================

            solarPlantLive:
               Number(
                  solarPlantLive.toFixed(2)
               ),

            gridLive:
               Number(
                  gridLive.toFixed(2)
               ),

            dgLive:
               Number(
                  dgLive.toFixed(2)
               ),

            plantLoad:
               Number(
                  plantLoad.toFixed(2)
               ),

            // =====================
            // GENERATION
            // =====================

            solarGenerationToday:
               Number(
                  solarGenerationToday.toFixed(2)
               ),

            // =====================
            // IMPORT EXPORT
            // =====================

            rsebImport:
               Number(
                  (
                     meterData?.meter_grid?.kWh_Total_Import || 0
                  ).toFixed(2)
               ),

            rsebExport:
               Number(
                  (
                     meterData?.meter_grid?.kWh_Total_Export || 0
                  ).toFixed(2)
               ),

            // =====================
            // DG STATUS
            // =====================

            dg250Status:
               meterData?.meter_dg?.AC_Active_Power > 0
                  ? 'Running'
                  : 'Stopped',

            dg500_1_Status:
               meterData?.meter_dg58?.AC_Active_Power > 0
                  ? 'Running'
                  : 'Stopped',

            dg500_2_Status:
               'Unavailable',

            // =====================
            // COUNTS
            // =====================

            inverterCount:
               inverters.length,

            meterCount:
               meters.length

         },

         inverters: inverterData,

         meters: meterData,

         alerts

      };

   }

   catch (err) {

      console.log(
         'LIVE SERVICE ERROR:',
         err
      );

      return {

         success: false,

         message: err.message

      };

   }

};