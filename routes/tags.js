import express from 'express';
var router = express.Router();

/* GET tags names */
router.get('/', async function(req, res, next) {
  let {limit} = req.query;
  limit = Number(limit);

  if(!Number.isInteger(limit))
    limit = 50;
  
  let result;
  try {
    result = await sequelizeDB["Tags"].listTags(limit);
    result = result.map((tag) => ( {name: tag.tag_name } ) );
  } catch(err) {
    console.log(`Error occurs during getting tags :` + err);
    return res.json({ success: false, result: {}});
  }
  

  
  res.json({ 
    success: true, 
    result: result
  });
});

export default router;