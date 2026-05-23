const {
   DynamoDBClient
} = require(
   "@aws-sdk/client-dynamodb"
);

const {
   DynamoDBDocumentClient,
   QueryCommand
} = require(
   "@aws-sdk/lib-dynamodb"
);



const sites =
require("../constants/sites");



/* =====================================
   DYNAMODB CLIENT
===================================== */

const client =
new DynamoDBClient({

   region:
   process.env.AWS_REGION,

   credentials: {

      accessKeyId:
      process.env.AWS_ACCESS_KEY_ID,

      secretAccessKey:
      process.env.AWS_SECRET_ACCESS_KEY
   }
});



const dynamo =
DynamoDBDocumentClient.from(
   client
);



/* =====================================
   GET LATEST PAYLOAD
===================================== */

exports.getLatestPayload =
async (siteId) => {

   const site =
   sites[siteId];



   if (!site) {

      throw new Error(
         "Invalid site ID"
      );
   }



   const params = {

      TableName:
      site.tableName,

      KeyConditionExpression:
      "deviceId = :deviceId",

      ExpressionAttributeValues: {

         ":deviceId":
         site.deviceId
      },

      ScanIndexForward: false,

      Limit: 1
   };



   const data =
   await dynamo.send(

      new QueryCommand(params)
   );



   return data.Items?.[0];
};



/* =====================================
   GET START OF DAY PAYLOAD
===================================== */

exports.getDayStartPayload =
async (siteId) => {

   const site =
   sites[siteId];



   if (!site) {

      throw new Error(
         "Invalid site ID"
      );
   }



   const startOfDay =
   new Date();

   startOfDay.setHours(
      0,0,0,0
   );



  const params = {

   TableName:
   site.tableName,

   KeyConditionExpression:
   "deviceId = :deviceId AND #timestamp >= :timestamp",

   ExpressionAttributeNames: {

      "#timestamp": "timestamp"
   },

   ExpressionAttributeValues: {

      ":deviceId":
      site.deviceId,

      ":timestamp":
      new Date(
         startOfDay
      ).toISOString()
   },

   ScanIndexForward: true,

   Limit: 1
};



   const data =
   await dynamo.send(

      new QueryCommand(params)
   );



   return data.Items?.[0];
};