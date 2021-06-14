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

  if(!start)
    start = NaN;
  
  try {
    let result = await sequelizeDB["Posts"].list(search_words, start);
    const last_id = result[result.length - 1].id;
    res.json({ success: true, result: result , last_id: last_id});
  } catch(err) {
    res.status(400).send({
      success: false,
      message: `Error occurs ${err}`
    });
  }
    
});

// give a like to a post with id.
router.post('/:id', function(req, res, next) {
  const {id} = req.params;
  if (!id) {
      const err = new Error('Post ID is required');
      err.status = 400;
      throw err;
  }
  
});

export default router;