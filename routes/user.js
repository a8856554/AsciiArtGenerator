import express from 'express';
var router = express.Router();

/* GET user's profile */
router.get('/', async function(req, res, next) {
  const user_id = req.decoded.id;
  const user_name = req.decoded.user_name;
  
  try {
    var result = await sequelizeDB["Users"].find(user_name);
  } catch(err) {
    console.log(`Error occurs during getting user's profile :` + err);
    return res.json({ success: false, result: {}});
  }
  

  
  res.json({ 
    success: true, 
    result: {
      "id": result.id,
      "user_name": result.user_name,
      "first_name": result.first_name,
      "last_name": result.last_name,
      "email": result.email,
      "createdAt": result.createdAt,
      "updatedAt": result.updatedAt
    }
  });
});

export default router;
