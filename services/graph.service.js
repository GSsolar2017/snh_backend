const dynamoDB =
require('../aws/dynamodb');

const {
   QueryCommand
} = require('@aws-sdk/lib-dynamodb');

const sites =
require('../constants/sites');

const {

   parseData,

   getSolarLive,

   getDGTotal,

   getGridLive,

   getSolarDayTotal,

   getGridImport,

   getGridExport

} = require('../helpers/dashboard.helper');


// =========================
// DAY RANGE
// =========================

const getDayRange = (date) => {

   const start =
      new Date(`${date}T00:00:00.000Z`);

   const end =
      new Date(`${date}T23:59:59.999Z`);

   return {

      start: start.toISOString(),

      end: end.toISOString()

   };

};


// =========================
// GET ROWS
// =========================

const getRows =
async (site, start, end) => {

   let items = [];

   let ExclusiveStartKey = undefined;

   do {

      const result =
         await dynamoDB.send(
            new QueryCommand({

               TableName:
                  site.tableName,

               KeyConditionExpression:
                  'deviceId = :deviceId AND #ts BETWEEN :start AND :end',

               ExpressionAttributeNames: {
                  '#ts': 'timestamp'
               },

               ExpressionAttributeValues: {

                  ':deviceId':
                     site.deviceId,

                  ':start':
                     start,

                  ':end':
                     end

               },

               ScanIndexForward: true,

               ExclusiveStartKey

            })
         );

      items.push(
         ...(result.Items || [])
      );

      ExclusiveStartKey =
         result.LastEvaluatedKey;

   } while (ExclusiveStartKey);

   items.sort((a, b) => {

      return new Date(a.timestamp)
      - new Date(b.timestamp);

   });

   return items;

};


// =========================
// ENERGY SOURCE GRAPH
// =========================

exports.getEnergySourceGraph =
async (siteId, date) => {

   const site = sites[siteId];

   if (!site) {
      throw new Error('Invalid Site');
   }

   const { start, end } =
      getDayRange(date);

   const rows =
      await getRows(
         site,
         start,
         end
      );

   const filtered =
      rows.filter((_, index) => {

         return index % 10 === 0;

      });

   return filtered.map((row) => {

      const inverters =
         parseData(row.inverters);

      const meters =
         parseData(row.meters);

      const solar =
         getSolarLive(inverters);

      const grid =
         getGridLive(meters);

      const dg =
         getDGTotal(meters);

      return {

         timestamp:
            row.timestamp,

         solar,

         grid,

         dg,

         load:
            Number((
               solar +
               grid +
               dg
            ).toFixed(2))

      };

   });

};


// =========================
// INVERTER GRAPH
// =========================

exports.getInverterGraph =
async (siteId, date) => {

   const site = sites[siteId];

   if (!site) {
      throw new Error('Invalid Site');
   }

   const { start, end } =
      getDayRange(date);

   const rows =
      await getRows(
         site,
         start,
         end
      );

   const filtered =
      rows.filter((_, index) => {

         return index % 10 === 0;

      });

   return filtered.map((row) => {

      const inverters =
         parseData(row.inverters);

      const data = {

         timestamp:
            row.timestamp

      };

      Object.entries(inverters)
         .forEach(([key, value]) => {

            data[key] =
               Number((

                  (value.AC_Active_Power || 0)
                  / 1000

               ).toFixed(2));

         });

      return data;

   });

};


// =========================
// IMPORT EXPORT GRAPH
// =========================

exports.getImportExportGraph =
async (siteId, date) => {

   const site = sites[siteId];

   if (!site) {
      throw new Error('Invalid Site');
   }

   const month = new Date(date);

   const start =
      new Date(Date.UTC(
         month.getUTCFullYear(),
         month.getUTCMonth(),
         1
      ));

   const end =
      new Date(Date.UTC(
         month.getUTCFullYear(),
         month.getUTCMonth() + 1,
         0,
         23,
         59,
         59
      ));

   // const rows =
   //    await getRows(
   //       site,
   //       start.toISOString(),
   //       end.toISOString()
   //    );

   // const rows =
   // (await getRows(
   //    site,
   //    start.toISOString(),
   //    end.toISOString()
   // )).slice(-3000);

   const rows = (
   await getRows(
      site,
      start.toISOString(),
      end.toISOString()
   )
   ).slice(-500);
   const grouped = {};

     // Rakshit Add

   const now = new Date();

   const filteredRows = rows.filter(
      row => new Date(row.timestamp) <= now
   );
   // ==============

   filteredRows  // Rakshit Add

   const now = new Date();

   const filteredRows = rows.filter(
      row => new Date(row.timestamp) <= now
   );
   // ==============.forEach((row) => {

      if (!row.timestamp) return;

      const day =
         row.timestamp.split('T')[0];

      if (!grouped[day]) {
         grouped[day] = [];
      }

      grouped[day].push(row);

   });

   return Object.entries(grouped)
      .map(([date, records]) => {

         records.sort((a, b) =>
            new Date(a.timestamp)
            - new Date(b.timestamp)
         );

         const first = records[0];
         const last = records[records.length - 1];

         const firstMeters =
            parseData(first.meters || {});

         const lastMeters =
            parseData(last.meters || {});

         const importValue =
            Number(getGridImport(lastMeters) || 0)
            -
            Number(getGridImport(firstMeters) || 0);

         const exportValue =
            Number(getGridExport(lastMeters) || 0)
            -
            Number(getGridExport(firstMeters) || 0);

         return {

            date,

            import:
               Number(importValue.toFixed(2)),

            export:
               Number(exportValue.toFixed(2))

         };

      });

};

// =========================
// SOLAR GENERATION GRAPH
// =========================

exports.getSolarGenerationGraph =
async (siteId, date) => {

   const site = sites[siteId];

   if (!site) {
      throw new Error('Invalid Site');
   }

   const month =
      new Date(date);

   const start =
      new Date(Date.UTC(
         month.getUTCFullYear(),
         month.getUTCMonth(),
         1
      ));

   const end =
      new Date(Date.UTC(
         month.getUTCFullYear(),
         month.getUTCMonth() + 1,
         0,
         23,
         59,
         59
      ));

   // const rows =
   //    await getRows(
   //       site,
   //       start.toISOString(),
   //       end.toISOString()
   //    );
   // const rows =
   // (await getRows(
   //    site,
   //    start.toISOString(),
   //    end.toISOString()
   // )).slice(-3000);

   const rows = (
   await getRows(
      site,
      start.toISOString(),
      end.toISOString()
   )
).slice(-500);

   const grouped = {};
   // Rakshit Add

   const now = new Date();

   const filteredRows = rows.filter(
      row => new Date(row.timestamp) <= now
   );
   // ==============
   filteredRows.forEach((row) => {

      if (!row.timestamp) return;

      const day =
         row.timestamp.split('T')[0];

      if (!grouped[day]) {
         grouped[day] = [];
      }

      grouped[day].push(row);

   });

   return Object.entries(grouped)
      .map(([date, records]) => {

         records.sort((a, b) =>
            new Date(a.timestamp)
            - new Date(b.timestamp)
         );

         const last =
            records[records.length - 1];

         const inverters =
            parseData(last.inverters || {});

         const generation =
            Number(
               getSolarDayTotal(inverters) || 0
            );

         return {

            date,

            generation:
               Number(generation.toFixed(2))

         };

      });

};