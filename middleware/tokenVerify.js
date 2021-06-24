import jwt from 'jsonwebtoken';
/**
  * A middleware function checks if web requests have a valid jwt.
  */
export default function tokenVerify(req, res, next) {
  let token = req.body.token || req.query.token || req.headers['authorization']
  console.log(token);
  token = token.replace('Bearer ','');
	console.log(req.cookies);
	

  if (token) {
    jwt.verify(token, process.env.SECRET, function (err, decoded) {
      if (err) 
        return res.json({success: false, message: 'Failed to authenticate token.'});
      
      if(decoded.type !== "access_token")
        return res.json({success: false, message: 'You should provide an access token.'});

      req.decoded = decoded;
      next()
      
    })
  } else {
    return res.status(403).send({
      success: false,
      message: 'No token provided.'
    })
  }
}