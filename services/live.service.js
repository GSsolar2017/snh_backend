const dynamoDB = require('../aws/dynamodb');

const { QueryCommand } =
require('@aws-sdk/lib-dynamodb');

const sites =
require('../constants/sites');

exports.getLiveData = async (siteId) => {

   const site = sites[siteId];

   if (!site) {
      throw new Error('Invalid Site');
   }

   const params = {

      TableName: site.tableName,

      KeyConditionExpression:
         'deviceId = :deviceId',

      ExpressionAttributeValues: {
         ':deviceId': site.deviceId
      },

      ScanIndexForward: false,

      Limit: 1

   };

   const result = await dynamoDB.send(
      new QueryCommand(params)
   );

   if (!result.Items.length) {
      throw new Error('No Data Found');
   }

   const raw = result.Items[0];

   // =========================
   // DEBUG LOGGER DATA
   // =========================

   console.log(
      JSON.stringify(raw, null, 2)
   );

   // =========================
   // HANDLE STRINGIFIED DATA
   // =========================

   let inverterData = {};

   try {

      inverterData =
         typeof raw.inverters === 'string'
            ? JSON.parse(raw.inverters)
            : raw.inverters || {};

   } catch(err) {

      console.log(
         'Inverter Parse Error',
         err
      );
   }

   let meterData = {};

   try {

      meterData =
         typeof raw.meters === 'string'
            ? JSON.parse(raw.meters)
            : raw.meters || {};

   } catch(err) {

      console.log(
         'Meter Parse Error',
         err
      );
   }

   const inverters =
      Object.entries(inverterData);

   const meters =
      Object.entries(meterData);

   // =========================
   // SOLAR PLANT LIVE (kW)
   // =========================

   const solarPlantLive =
      inverters.reduce((sum, [key, val]) => {

         return sum +
         ((val.AC_Active_Power || 0) / 1000);

      }, 0);

   // =========================
   // SOLAR GENERATION TODAY (kWh)
   // =========================

   const solarGenerationToday =
      inverters.reduce((sum, [key, val]) => {

         return sum +
         (val.kWh_Day_Active || 0);

      }, 0);

   // =========================
   // GRID LIVE (kW)
   // =========================

   const gridLive =
      (
         (meterData.meter_grid1?.AC_Active_Power || 0) +
         (meterData.meter_grid2?.AC_Active_Power || 0)
      ) / 1000;

   // =========================
   // DG LIVE (kW)
   // =========================

   const dgLive =
      (
         (meterData.meter_dg250?.AC_Active_Power || 0) +
         (meterData.meter_dg500_1?.AC_Active_Power || 0) +
         (meterData.meter_dg500_2?.AC_Active_Power || 0)
      ) / 1000;

   // =========================
   // PLANT LOAD (kW)
   // =========================

   const plantLoad =
      solarPlantLive +
      gridLive +
      dgLive;

   // =========================
   // ALERTS
   // =========================

   const alerts = [];
return {

   siteName: site.siteName,

   timestamp: raw.timestamp,

   cards: {

      // =====================
      // LIVE POWER
      // =====================

      solarPlantLive:
         Number(solarPlantLive.toFixed(2)),

      gridLive:
         Number(gridLive.toFixed(2)),

      dgLive:
         Number(dgLive.toFixed(2)),

      plantLoad:
         Number(plantLoad.toFixed(2)),

      // =====================
      // GENERATION
      // =====================

      solarGenerationToday:
         Number(solarGenerationToday.toFixed(2)),

      // =====================
      // GRID IMPORT EXPORT
      // =====================

      rsebImport:
         Number(
            (
               meterData.meter_grid1?.kWh_Total_Import || 0
            ).toFixed(2)
         ),

      rsebExport:
         Number(
            (
               meterData.meter_grid1?.kWh_Total_Export || 0
            ).toFixed(2)
         ),

      // =====================
      // DG STATUS
      // =====================

      dg250Status:
         meterData.meter_dg250?.AC_Active_Power > 0
            ? 'Running'
            : 'Stopped',

      dg500_1_Status:
         meterData.meter_dg500_1?.AC_Active_Power > 0
            ? 'Running'
            : 'Stopped',

      dg500_2_Status:
         meterData.meter_dg500_2?.AC_Active_Power > 0
            ? 'Running'
            : 'Stopped',

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
};