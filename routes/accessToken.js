import express from 'express';
import jwt from 'jsonwebtoken';
var router = express.Router();

/* Get a new access token by a refresh token */
router.get('/', async function(req, res, next) {
  if(!req.cookies.refresh_token)
    return res.json({ success: false, result: {}, message: 'Please provide a refresh_token'});

	let refresh_token = req.cookies.refresh_token;

  jwt.verify(refresh_token, process.env.SECRET, function (err, decoded) {
    if (err) 
      return res.json({success: false, message: 'Failed to authenticate refresh_token.'});
    
    if(decoded.type !== "refresh_token")
      return res.json({success: false, message: 'You should provide a refresh_token.'});

    const jwt_data = {
        id: decoded.id,
        user_name: decoded.user_name,
        firstName: decoded.firstName,
        lastName: decoded.lastName,
        type: 'access_token',
    }
    const token = jwt.sign(jwt_data, process.env.SECRET, {
        expiresIn: 60*60*1 //in seconds
    });
    res.json({
      success: true,
      access_token: token,
    });
  })

});

export default router;