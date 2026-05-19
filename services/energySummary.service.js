const dynamoDB =
require('../aws/dynamodb');

const {
   QueryCommand
} = require('@aws-sdk/lib-dynamodb');

const sites =
require('../constants/sites');

exports.getEnergySummary =
async (siteId) => {

   const site = sites[siteId];

   if (!site) {
      throw new Error('Invalid Site');
   }

   const now = new Date();

   // =========================
   // START OF DAY
   // =========================

   const startOfDay =
      new Date();

   startOfDay.setUTCHours(
      0, 0, 0, 0
   );

   // =========================
   // START OF MONTH
   // =========================

   const startOfMonth =
      new Date(Date.UTC(

         now.getUTCFullYear(),
         now.getUTCMonth(),
         1,
         0,
         0,
         0

      ));

   // =========================
   // GET LATEST ROW
   // =========================

   const latestResult =
      await dynamoDB.send(
         new QueryCommand({

            TableName:
               site.tableName,

            KeyConditionExpression:
               'deviceId = :deviceId',

            ExpressionAttributeValues: {
               ':deviceId':
                  site.deviceId
            },

            ScanIndexForward: false,

            Limit: 1

         })
      );

   if (!latestResult.Items?.length) {
      throw new Error('No Latest Data Found');
   }

   // =========================
   // GET DAY START ROW
   // =========================

   const dayResult =
      await dynamoDB.send(
         new QueryCommand({

            TableName:
               site.tableName,

            KeyConditionExpression:
               'deviceId = :deviceId AND #ts >= :startDay',

            ExpressionAttributeNames: {
               '#ts': 'timestamp'
            },

            ExpressionAttributeValues: {

               ':deviceId':
                  site.deviceId,

               ':startDay':
                  startOfDay.toISOString()

            },

            ScanIndexForward: true,

            Limit: 1

         })
      );

   // =========================
   // GET MONTH START ROW
   // =========================

   const monthResult =
      await dynamoDB.send(
         new QueryCommand({

            TableName:
               site.tableName,

            KeyConditionExpression:
               'deviceId = :deviceId AND #ts >= :startMonth',

            ExpressionAttributeNames: {
               '#ts': 'timestamp'
            },

            ExpressionAttributeValues: {

               ':deviceId':
                  site.deviceId,

               ':startMonth':
                  startOfMonth.toISOString()

            },

            ScanIndexForward: true,

            Limit: 1

         })
      );

   // =========================
   // FALLBACKS
   // =========================

   const latest =
      latestResult.Items[0];

   const dayStart =
      dayResult.Items?.[0] || latest;

   const monthStart =
      monthResult.Items?.[0] || latest;

   // =========================
   // SAFE PARSE
   // =========================

   const parseData = (data) => {

      try {

         return typeof data === 'string'
            ? JSON.parse(data)
            : data || {};


      } catch {

         return {};

      }

   };

   const latestInv =
      parseData(latest.inverters);

   const dayInv =
      parseData(dayStart.inverters);

   const monthInv =
      parseData(monthStart.inverters);

   const latestMeters =
      parseData(latest.meters);

   const dayMeters =
      parseData(dayStart.meters);

   const monthMeters =
      parseData(monthStart.meters);

   // =========================
   // SOLAR TOTAL
   // =========================

   const getTotalSolar =
      (inv) => {

      return Object.values(inv)
         .reduce((sum, inverter) => {

            return sum +
            Number(
               inverter.kWh_Total_Active || 0
            );

         }, 0);

   };

   // =========================
   // GRID IMPORT
   // =========================

   const getGridImport =
      (meters) => {

      return (

         Number(
            meters.meter_grid1?.kWh_Total_Import || 0
         )

         +

         Number(
            meters.meter_grid2?.kWh_Total_Import || 0
         )

      );

   };

   // =========================
   // GRID EXPORT
   // =========================

   const getGridExport =
      (meters) => {

      return (

         Number(
            meters.meter_grid1?.kWh_Total_Export || 0
         )

         +

         Number(
            meters.meter_grid2?.kWh_Total_Export || 0
         )

      );

   };

   // =========================
   // SOLAR VALUES
   // =========================

   const todaySolar =
      getTotalSolar(latestInv)
      -
      getTotalSolar(dayInv);

   const monthSolar =
      getTotalSolar(latestInv)
      -
      getTotalSolar(monthInv);

   // =========================
   // GRID VALUES
   // =========================

   const gridImportToday =
      getGridImport(latestMeters)
      -
      getGridImport(dayMeters);

   const gridImportMonth =
      getGridImport(latestMeters)
      -
      getGridImport(monthMeters);

   const gridExportToday =
      getGridExport(latestMeters)
      -
      getGridExport(dayMeters);

   const gridExportMonth =
      getGridExport(latestMeters)
      -
      getGridExport(monthMeters);

   // =========================
   // RETURN
   // =========================

   return {

      todaySolar:
         Number(todaySolar.toFixed(2)),

      monthSolar:
         Number(monthSolar.toFixed(2)),

      gridImportToday:
         Number(gridImportToday.toFixed(2)),

      gridImportMonth:
         Number(gridImportMonth.toFixed(2)),

      gridExportToday:
         Number(gridExportToday.toFixed(2)),

      gridExportMonth:
         Number(gridExportMonth.toFixed(2))

   };

};