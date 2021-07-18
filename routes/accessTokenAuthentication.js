import express from 'express';
var router = express.Router();

/* Check if the provided access token is valid */
router.get('/', async function(req, res, next) {
  const user_id = req.decoded.id;
  // if user_id exists, we can know in tokenVerify.js, access_token was authenticated successfully.
  if(user_id)
    res.json({
      success: true,
    });
  else
  res.json({
    success: false,
  });
});

export default router;