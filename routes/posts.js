import express from 'express';
import multer  from 'multer';
import path from 'path';

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
router.post('/', upload.any(), async function(req, res, next) {
  const user_id = req.decoded.id;
  // image infomation.
  const { filename, mimetype, size } = req.files[0];
  // other parameters
  const { title, context } = req.body;
  const publicImagePath = path.join(process.env.DIR_NAME, imageSavePath, filename);

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

// list posts
router.get('/', async function(req, res, next) {
    
    
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