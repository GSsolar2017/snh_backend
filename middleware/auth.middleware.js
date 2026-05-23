const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {

   const authHeader =
      req.headers.authorization;

   if (!authHeader) {

      return res.status(401).json({
         message: 'Unauthorized'
      });
   }

   // Remove Bearer prefix
   const token =
      authHeader.startsWith('Bearer ')
         ? authHeader.split(' ')[1]
         : authHeader;

   try {

      const decoded =
         jwt.verify(
            token,
            process.env.JWT_SECRET
         );

      req.user = decoded;

      next();

   } catch (err) {

      console.log(err);

      return res.status(401).json({
         message: 'Invalid Token'
      });
   }
};