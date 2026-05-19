const liveService =
require('../services/live.service');

exports.getLiveData =
async(req,res)=>{

   try{

      const data =
      await liveService.getLiveData(
         req.params.siteId
      );

      res.json(data);

   }catch(err){

      res.status(500).json({
         message: err.message
      });

   }

}