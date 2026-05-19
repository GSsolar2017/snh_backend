exports.parseData = (data) => {

   if (!data) {
      return {};
   }

   return typeof data === 'string'
      ? JSON.parse(data)
      : data;

};

// SOLAR LIVE (kW)

exports.getSolarLive = (inverters) => {

   return Number(
      (
         Object.values(inverters)
            .reduce((sum, inverter) => {

               return sum +
                  ((inverter.AC_Active_Power || 0) * 0.001);

            }, 0)
      ).toFixed(2)
   );

};

// DG LIVE (kW)

exports.getDGTotal = (meters) => {

   return Number(
      (
         (
            (meters.meter_dg250?.AC_Active_Power || 0) +
            (meters.meter_dg500_1?.AC_Active_Power || 0) +
            (meters.meter_dg500_2?.AC_Active_Power || 0)
         ) * 0.001
      ).toFixed(2)
   );

};

// GRID LIVE (kW)

exports.getGridLive = (meters) => {

   return Number(
      (
         (
            (meters.meter_grid1?.AC_Active_Power || 0) +
            (meters.meter_grid2?.AC_Active_Power || 0)
         ) * 0.001
      ).toFixed(2)
   );

};

// SOLAR TOTAL ENERGY

exports.getSolarTotal = (inverters) => {

   return Object.values(inverters)
      .reduce((sum, inverter) => {

         return sum +
            (inverter.kWh_Total_Active || 0);

      }, 0);

};

// SOLAR DAY ENERGY

exports.getSolarDayTotal = (inverters) => {

   return Number(
      (
         Object.values(inverters)
            .reduce((sum, inverter) => {

               return sum +
                  (inverter.kWh_Day_Active || 0);

            }, 0)
      ).toFixed(2)
   );

};

// GRID IMPORT

exports.getGridImport = (meters) => {

   return (
      (meters.meter_grid1?.kWh_Total_Import || 0) +
      (meters.meter_grid2?.kWh_Total_Import || 0)
   );

};

// GRID EXPORT

exports.getGridExport = (meters) => {

   return (
      (meters.meter_grid1?.kWh_Total_Export || 0) +
      (meters.meter_grid2?.kWh_Total_Export || 0)
   );

};