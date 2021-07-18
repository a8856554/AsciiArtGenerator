import express from 'express';
import multer  from 'multer';
import path from 'path';
import tokenVerify from '../middleware/tokenVerify.js';

let router = express.Router();

const imageSavePath = './images/public/';
var upload = multer({
  //dest: imageSavePath,
  storage: multer.diskStorage(
    {
      destination: function (req, file, cb) {
        cb(null, imageSavePath);
      },
      filename: function (req, file, cb) {
        cb(
          null,
          new Date().valueOf() + 
          '_' +
          file.originalname
        );
      }
    }
  ), 
});
/*
// receive an image and an ascii string to create an user post.
// To use this API, logining in is necessary.
router.post('/',tokenVerify ,upload.any(), async function(req, res, next) {
  const user_id = req.decoded.id;
  let publicImagePath = '';

  // image infomation.
  if(req.files[0]){
    const { filename, mimetype, size } = req.files[0];
    publicImagePath = path.join(process.env.DIR_NAME, imageSavePath, filename);
  }
  // other parameters
  const { title, context } = req.body;
  

  if(!title || ! context)
    return res.status(400).send({
      success: false,
      message: `parameter title or context is not provided.`
    });

  try {
    const result = await sequelizeDB["Posts"].create(user_id, title, context ,publicImagePath);
    res.json({ success: true, result: result });
  } catch(err) {
    res.status(400).send({
      success: false,
      message: `Error occurs ${err}`
    });
  }
});
*/
// receive an image and an ascii string to create an user post.
// 
router.post('/',tokenVerify ,upload.any(), async function(req, res, next) {
  const user_id = req.decoded.id;
  let publicImagePath = '';

  // image infomation.
  if(req.files[0]){
    const { filename, mimetype, size } = req.files[0];
    publicImagePath = path.join(process.env.DIR_NAME, imageSavePath, filename);
  }
  // other parameters
  let { title, context , tags, width, height} = req.body;
  

  if(!title || !context)
    return res.status(400).send({
      success: false,
      message: `parameter title or context is not provided.`
    });
  
  if(!typeof(width)=='number' || !typeof(height)=='number')
    return res.status(400).send({
      success: false,
      message: `Please provide valid hieght and width.`
    });
  
  if(tags){
    tags = tags.split("#");
    // Remove the 1st element, since the 1st element in tags is "".
    tags.shift();
  }
  
  console.log(`${user_id} ${title} ${context} ${tags}`);
  try {
    const result = await sequelizeDB["Posts"].createWithTags(
      user_id, 
      title, 
      context , 
      width, 
      height, 
      publicImagePath,
      Array.isArray(tags) ? tags : [] );
    
    res.json({ success: true, result: result });
  } catch(err) {
    res.status(400).send({
      success: false,
      message: `Error occurs ${err}`
    });
  }
});

/**
 * List posts user searchs.
 * Need 2 optional parameters from req.query :
 *   search_words: a string contains keywords seperated by " ".
 *                 if client doesn't provide, API will search all posts records.
 *   start:        a number represents id of the last posts, API will search from this id to older posts.
 *                 if client doesn't provide, API will search all posts records.
 */
router.get('/', async function(req, res, next) {
  
  let {search_words, start} = req.query;

  if(search_words)
    search_words = search_words.split(" ");
  else
    search_words = [];

  // Check start type, if it doesn't exist then assign it as NaN.
  if(!start)
    start = NaN;
  else
    start = parseInt(start, 10);
  
  try {
    //let result = await sequelizeDB["Posts"].list(search_words, start);
    let result = await sequelizeDB["Posts"].listWithTags(search_words, start);
    
    const last_id = result.length > 0 ? result[result.length - 1].id : -1;
    res.json({ success: true, result: result , last_id: last_id});
  } catch(err) {
    
    res.status(400).send({
      success: false,
      message: `Error occurs ${err}`
    });
  }
});



// update a post's likes
router.put('/:id/like_num', tokenVerify, async function(req, res, next) {
  const user_id = req.decoded.id;
  const {id} = req.params;
  
  if (!id)   
    return res.status(400).json({ success: false, message: 'Post ID is required' });
  
  let post = await sequelizeDB["Posts"].find(id);
  let db_like = await sequelizeDB["PostLikes"].find(id, user_id);

  if(!db_like){
    sequelizeDB["PostLikes"].create(id, user_id);
    post.like_num = post.like_num +1;
  }   
  else{
    sequelizeDB["PostLikes"].deleteLike(id, user_id);
    post.like_num = post.like_num -1;
  }
  
  await post.save();
  res.json({ success: true, result: {like_num: post.like_num},message: `Update post ${id} successfully`});
  
});

// update a post's views
router.put('/:id/views', async function(req, res, next) {
  const {id} = req.params;
  

  if (!id)   
    return res.status(400).json({ success: false, message: 'Post ID is required' });
  
  let post = await sequelizeDB["Posts"].find(id);

  if(post)
    post.views = post.views +1;
  
  
  await post.save();
  res.json({ success: true, result: {views: post.views},message: `Update post ${id} successfully`});
  
});

// Delete a post with id.
router.delete('/:id', async function (req, res) {
  const {id} = req.params;
  try {
    
    let result = await sequelizeDB["Posts"].deleteById(id);
    res.json({ success: true, result: result });
  } catch(err) {
    res.status(400).send({
      success: false,
      message: `Error occurs ${err}`
    });
  }
});

export default router;