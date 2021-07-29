import express from 'express';
let router = express.Router();

/**
 * List posts user searchs by tags.
 * 
 *   search_tags: a string contains keywords seperated by " ".
 *                 if client doesn't provide, API will return an error.
 * Need 1 optional parameters from req.query :
 *   start:        a number represents id of the last posts, API will search from this id to older posts.
 *                 if client doesn't provide, API will search from the latest posts records.
 */
 router.get('/', async function(req, res, next) {
  
  let {search_tags, start} = req.query;

  if(search_tags){
    search_tags = search_tags.split(" ");
    console.log(search_tags)
  }
  else
    search_tags = [];

  // Check start type, if it doesn't exist then assign it as NaN.
  if(!start)
    start = NaN;
  else
    start = parseInt(start, 10);
  
  try {
    
    let result = await sequelizeDB["Posts"].listByTags(search_tags, start);
    const last_id = result.length > 0 ? result[result.length - 1].id : -1;
    res.json({ success: true, result: result , last_id: last_id});
  } catch(err) {
    res.status(400).send({
      success: false,
      message: `Error occurs ${err}`
    });
  }
});

export default router;