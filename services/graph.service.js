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

   // DEFAULT TODAY
   if (!date) {

      date =
         new Date()
         .toISOString()
         .split("T")[0];
   }

   // LOCAL TIME (NO UTC SHIFT)
   const start =
      new Date(`${date}T00:00:00`);

   const end =
      new Date(`${date}T23:59:59`);

   return {

      start:
         start.toISOString(),

      end:
         end.toISOString()

   };

};



// =========================
// GET ROWS
// =========================

const getRows =
async (site, start, end) => {

   let items = [];

   let ExclusiveStartKey =
      undefined;

   do {

      const result =
         await dynamoDB.send(

            new QueryCommand({

               TableName:
                  site.tableName,

               KeyConditionExpression:
                  'deviceId = :deviceId AND #ts BETWEEN :start AND :end',

               ExpressionAttributeNames: {

                  '#ts':
                     'timestamp'
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

   }

   while (ExclusiveStartKey);



   items.sort((a, b) => {

      return (
         new Date(a.timestamp)
         -
         new Date(b.timestamp)
      );

   });

   return items;

};



// =========================
// SMART FILTER
// =========================

const getFilteredRows = (rows) => {

   if (!rows.length) return [];

   const step =
      Math.max(
         1,
         Math.ceil(rows.length / 100)
      );

   return rows.filter((_, index) => {

      return index % step === 0;

   });

};



// =========================
// ENERGY SOURCE GRAPH
// =========================

exports.getEnergySourceGraph =
async (siteId, date) => {

   console.log("siteId:", siteId);
   console.log("available sites:", Object.keys(sites));

   const site =
      sites[siteId?.trim()];

   if (!site) {

      return {

         success: false,

         message: 'Invalid siteId'
      };
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
      getFilteredRows(rows);

   const labels =
      filtered.map(row =>

         new Date(row.timestamp)
         .toLocaleTimeString([], {

            hour: '2-digit',
            minute: '2-digit'

         })

      );

   const solarData =
      filtered.map(row => {

         const inverters =
            parseData(row.inverters || {});

         return Number(
            getSolarLive(inverters) || 0
         );

      });

   const gridData =
      filtered.map(row => {

         const meters =
            parseData(row.meters || {});

         return Number(
            getGridLive(meters) || 0
         );

      });

   const dgData =
      filtered.map(row => {

         const meters =
            parseData(row.meters || {});

         return Number(
            getDGTotal(meters) || 0
         );

      });

   return {

      success: true,

      labels,

      datasets: [

         {

            label: 'Solar',

            data: solarData,

            borderColor: '#22c55e',

            backgroundColor:
               'rgba(34,197,94,0.2)',

            fill: false,

            tension: 0.4

         },

         {

            label: 'Grid',

            data: gridData,

            borderColor: '#3b82f6',

            backgroundColor:
               'rgba(59,130,246,0.2)',

            fill: false,

            tension: 0.4

         },

         {

            label: 'DG',

            data: dgData,

            borderColor: '#f97316',

            backgroundColor:
               'rgba(249,115,22,0.2)',

            fill: false,

            tension: 0.4

         }

      ]

   };

};



// =========================
// INVERTER GRAPH
// =========================

exports.getInverterGraph =
async (siteId, date) => {

   const site =
      sites[siteId?.trim()];

   if (!site) {

      return {

         success: false,

         message: 'Invalid siteId'
      };
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
      getFilteredRows(rows);

   const labels =
      filtered.map(row =>

         new Date(row.timestamp)
         .toLocaleTimeString([], {

            hour: '2-digit',
            minute: '2-digit'

         })

      );

   const inverterMap = {};

   filtered.forEach((row, rowIndex) => {

      const inverters =
         parseData(row.inverters || {});

      Object.keys(inverterMap)
      .forEach((key) => {

         if (!inverters[key]) {

            inverterMap[key].push(null);
         }

      });

      Object.entries(inverters)
      .forEach(([key, value]) => {

         if (!inverterMap[key]) {

            inverterMap[key] =
               Array(rowIndex).fill(null);
         }

         inverterMap[key].push(

            Number(

               (
                  (value.AC_Active_Power || 0)
                  / 1000

               ).toFixed(2)
            )
         );

      });

   });

   Object.keys(inverterMap)
   .forEach((key) => {

      while (
         inverterMap[key].length < labels.length
      ) {

         inverterMap[key].push(null);
      }

   });

   const colors = [

      "#22c55e",
      "#3b82f6",
      "#f97316",
      "#a855f7",
      "#ef4444",
      "#14b8a6"

   ];

   const datasets =
      Object.keys(inverterMap)
      .map((key, index) => ({

         label: key,

         data:
            inverterMap[key],

         borderColor:
            colors[index % colors.length],

         backgroundColor:
            colors[index % colors.length] + "33",

         fill: false,

         tension: 0.4

      }));

   return {

      success: true,

      labels,

      datasets

   };

};



// =========================
// IMPORT EXPORT GRAPH
// =========================

exports.getImportExportGraph =
async (siteId, date) => {

   const site =
      sites[siteId?.trim()];

   if (!site) {

      return {

         success: false,

         message: 'Invalid siteId'
      };
   }

   const month =
      date
         ? new Date(date)
         : new Date();

   const start =
      new Date(

         month.getFullYear(),

         month.getMonth(),

         1

      );

   const end =
      new Date(

         month.getFullYear(),

         month.getMonth() + 1,

         0,

         23,

         59,

         59

      );

   const rows =
      await getRows(

         site,

         start.toISOString(),

         end.toISOString()

      );

   // LIMIT HUGE DATASET
   const limitedRows =
      rows.slice(-5000);

   const grouped = {};

   limitedRows.forEach((row) => {

      if (!row?.timestamp) return;

      const day =
         row.timestamp.split('T')[0];

      if (!grouped[day]) {

         grouped[day] = [];
      }

      grouped[day].push(row);

   });

   const result =
      Object.entries(grouped)
      .map(([date, records]) => {

         records.sort((a, b) =>

            new Date(a.timestamp)
            -
            new Date(b.timestamp)

         );

         const first =
            records[0];

         const last =
            records[records.length - 1];

         const firstMeters =
            parseData(first?.meters || {});

         const lastMeters =
            parseData(last?.meters || {});

         const importStart =
            Number(
               getGridImport(firstMeters)
            ) || 0;

         const importEnd =
            Number(
               getGridImport(lastMeters)
            ) || 0;

         const exportStart =
            Number(
               getGridExport(firstMeters)
            ) || 0;

         const exportEnd =
            Number(
               getGridExport(lastMeters)
            ) || 0;

         const importValue =
            importEnd - importStart;

         const exportValue =
            exportEnd - exportStart;

         return {

            date,

            import:
               Number(importValue.toFixed(2)),

            export:
               Number(exportValue.toFixed(2))

         };

      });

   return {

      success: true,

      labels:
         result.map(item => item.date),

      datasets: [

         {

            label: 'Import',

            data:
               result.map(item => item.import),

            backgroundColor:
               'rgba(59,130,246,0.7)',

            borderColor:
               '#3b82f6',

            borderWidth: 1

         },

         {

            label: 'Export',

            data:
               result.map(item => item.export),

            backgroundColor:
               'rgba(34,197,94,0.7)',

            borderColor:
               '#22c55e',

            borderWidth: 1

         }

      ]

   };

};



// =========================
// SOLAR GENERATION GRAPH
// =========================

exports.getSolarGenerationGraph =
async (siteId, date) => {

   const site =
      sites[siteId?.trim()];

   if (!site) {

      return {

         success: false,

         message: 'Invalid siteId'
      };
   }

   const month =
      date
         ? new Date(date)
         : new Date();

   const start =
      new Date(

         month.getFullYear(),

         month.getMonth(),

         1

      );

   const end =
      new Date(

         month.getFullYear(),

         month.getMonth() + 1,

         0,

         23,

         59,

         59

      );

   const rows =
      await getRows(

         site,

         start.toISOString(),

         end.toISOString()

      );

   // LIMIT HUGE DATASET
   const limitedRows =
      rows.slice(-5000);

   const grouped = {};

   limitedRows.forEach((row) => {

      if (!row?.timestamp) return;

      const day =
         row.timestamp.split('T')[0];

      if (!grouped[day]) {

         grouped[day] = [];
      }

      grouped[day].push(row);

   });

   const result =
      Object.entries(grouped)
      .map(([date, records]) => {

         records.sort((a, b) =>

            new Date(a.timestamp)
            -
            new Date(b.timestamp)

         );

         const last =
            records[records.length - 1];

         const inverters =
            parseData(last?.inverters || {});

         const solarTotal =
            getSolarDayTotal(inverters);

         const generation =
            Number(solarTotal) || 0;

         return {

            date,

            generation:
               Number(generation.toFixed(2))

         };

      });

   return {

      success: true,

      labels:
         result.map(item => item.date),

      values:
         result.map(item => item.generation)

   };

};