exports.parseData = (data) => {

   if (!data) {
      return {};
   }

   return typeof data === 'string'
      ? JSON.parse(data)
      : data;
};



/* =========================================
   SOLAR LIVE (kW)
========================================= */

exports.getSolarLive = (inverters = {}) => {

   return Number(

      (
         Object.values(inverters)

            .reduce((sum, inverter) => {

               return sum +

                  (
                     Number(
                        inverter.AC_Active_Power || 0
                     )
                  );

            }, 0)

         * 0.001

      ).toFixed(2)
   );
};



/* =========================================
   DG LIVE (kW)
========================================= */

exports.getDGTotal = (meters = {}) => {

   return Number(

      (
         Object.entries(meters)

            .filter(([key]) =>

               key.toLowerCase().includes('dg')
            )

            .reduce((sum, [, meter]) => {

               return sum +

                  Number(
                     meter.AC_Active_Power || 0
                  );

            }, 0)

         * 0.001

      ).toFixed(2)
   );
};



/* =========================================
   GRID LIVE (kW)
========================================= */

exports.getGridLive = (meters = {}) => {

   return Number(

      (
         Object.entries(meters)

            .filter(([key]) =>

               key.toLowerCase().includes('grid')
            )

            .reduce((sum, [, meter]) => {

               return sum +

                  Number(
                     meter.AC_Active_Power || 0
                  );

            }, 0)

         * 0.001

      ).toFixed(2)
   );
};



/* =========================================
   PLANT LOAD (kW)
========================================= */

exports.getPlantLoad = (
   solarLive = 0,
   gridLive = 0,
   dgLive = 0
) => {

   return Number(

      (
         solarLive +
         gridLive +
         dgLive

      ).toFixed(2)
   );
};



/* =========================================
   SOLAR TOTAL ENERGY
========================================= */

exports.getSolarTotal = (
   inverters = {}
) => {

   return Number(

      Object.values(inverters)

         .reduce((sum, inverter) => {

            return sum +

               Number(
                  inverter.kWh_Total_Active || 0
               );

         }, 0)

         .toFixed(2)
   );
};



/* =========================================
   SOLAR DAY ENERGY
========================================= */

exports.getSolarDayTotal = (
   inverters = {}
) => {

   return Number(

      (
         Object.values(inverters)

            .reduce((sum, inverter) => {

               return sum +

                  Number(
                     inverter.kWh_Day_Active || 0
                  );

            }, 0)

      ).toFixed(2)
   );
};



/* =========================================
   GRID IMPORT
========================================= */

exports.getGridImport = (
   meters = {}
) => {

   return Number(

      Object.entries(meters)

         .filter(([key]) =>

            key.toLowerCase().includes('grid')
         )

         .reduce((sum, [, meter]) => {

            return sum +

               Number(
                  meter.kWh_Total_Import || 0
               );

         }, 0)

         .toFixed(2)
   );
};



/* =========================================
   GRID EXPORT
========================================= */

exports.getGridExport = (
   meters = {}
) => {

   return Number(

      Object.entries(meters)

         .filter(([key]) =>

            key.toLowerCase().includes('grid')
         )

         .reduce((sum, [, meter]) => {

            return sum +

               Number(
                  meter.kWh_Total_Export || 0
               );

         }, 0)

         .toFixed(2)
   );
};



/* =========================================
   INVERTER COUNT
========================================= */

exports.getInverterCount = (
   inverters = {}
) => {

   return Object.keys(
      inverters
   ).length;
};



/* =========================================
   METER COUNT
========================================= */

exports.getMeterCount = (
   meters = {}
) => {

   return Object.keys(
      meters
   ).length;
};