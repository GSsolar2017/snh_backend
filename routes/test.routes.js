const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
   res.json({
      message: 'Backend Running'
   });
});

const dynamoDB = require('../aws/dynamodb');
const { ListTablesCommand } = require('@aws-sdk/client-dynamodb');

router.get('/', async(req,res)=>{

 try {

   const data = await dynamoDB.send(
     new ListTablesCommand({})
   );

   res.json(data);

 } catch(err) {

   res.status(500).json({
     error: err.message
   });
 }
});
module.exports = router;