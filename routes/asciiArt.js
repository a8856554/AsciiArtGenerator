import express from 'express';
import path from 'path';
import Image_js from 'image-js';
import multer  from 'multer';
import * as tf from '@tensorflow/tfjs-node';
import sharp from 'sharp';
import Jimp from 'jimp';

import image2Canny from '../controllers/image2Canny.js';
import AsciiGenerator from '../controllers/AsciiGenerator.js';
import tensorflowStrategies from '../controllers/stragegy/deeplearning/tensorflowStrategies.js'

const Image = Image_js.Image;
let imageSavePath = './images/public/';

var router = express.Router();

router.get('/', async function(req, res, next) {
  const kernal_zise = 11;
  const character_pix = 30;
  const imageDirPath = path.join(process.env.DIR_NAME, './src/image/');
  const readImagePath = path.join(imageDirPath, 'hwei.png');
  const writeImagePath = path.join(imageDirPath, 'output.png');

  const image_width = 30*70;
  var jimpSrc = await Jimp.read(readImagePath);
  //console.log(jimpSrc);
  let dst = image2Canny(jimpSrc.bitmap, image_width, character_pix, kernal_zise);
  const col_num = Math.floor((dst.cols/character_pix));
  const row_num = Math.floor((dst.rows/character_pix));
  
  // Use Strategy to predict ascii characters.
  let asciiGenerator = new AsciiGenerator(new tensorflowStrategies["cnn"]("cnn_0"));
  let sub_image_array = asciiGenerator.generate(dst, character_pix);

  for (let i = 0; i < row_num; i++){
    let str = [];
    for (let j = 0; j < col_num; j++){
      str.push(sub_image_array[i][j])
      
    }
    str.push(sub_image_array[i].length);
    console.log(str.toString().replace(/,/g, ''));
  }


  // transform dst to RGBA 
  cv.cvtColor(dst, dst, cv.COLOR_GRAY2RGBA, 0);
  var outputImage = new Jimp(dst.cols, dst.rows);
  outputImage.bitmap.data = dst.data;
  outputImage.write(writeImagePath);
  
  
  /*
  outputImage.getBuffer(Jimp.MIME_PNG, (err, result)=>{
    res.set('Content-Type', Jimp.MIME_PNG);
    res.send(result);
  });
  */
  res.json({ ascii_art: sub_image_array })
  
  // remember to free the memory
  dst.delete();
});

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


// TODO : write a note of how to use upload.any() and req.files.
router.post('/' ,upload.any(), async function(req, res, next) {
  // the flag if we need console.log() result characters.
  let printArrayFlag = true;

  const character_pix = 30;
  const imageDirPath = path.join(process.env.DIR_NAME, './src/image/');
  const writeImagePath = path.join(imageDirPath, 'output.png');
  const publicImageDirPath = path.join(process.env.DIR_NAME, imageSavePath);

  const { kernal_zise, image_width , model_name} = req.body;
  const { filename, mimetype, size } = req.files[0];
  const publicImagePath = path.join(publicImageDirPath, filename);

  console.log(`${filename}, ${mimetype}, size: ${size}`);
  console.log(req.body);
  console.log(publicImagePath);
  
  var jimpSrc = await Jimp.read(publicImagePath);

  // parse image_width and kernal_zise as base 10 int. 
  let dst = image2Canny(jimpSrc.bitmap, parseInt(image_width, 10), character_pix, parseInt(kernal_zise, 10));
  
  // split the parameter model_name , get the model type. ex: "cnn"
  const model_type = model_name.split('_')[0];

  // Use Strategy to predict ascii characters. 
  // eg: new tensorflowStrategies["cnn"]("cnn_0")
  let asciiGenerator = new AsciiGenerator(new tensorflowStrategies[model_type](model_name));
  let sub_image_array = asciiGenerator.generate(dst, character_pix);

  if(printArrayFlag)
    print2DArray(sub_image_array);

  // transform dst to RGBA 
  cv.cvtColor(dst, dst, cv.COLOR_GRAY2RGBA, 0);
  var outputImage = new Jimp(dst.cols, dst.rows);
  outputImage.bitmap.data = dst.data;
  outputImage.write(writeImagePath);
  
  res.json({ ascii_art: sub_image_array })
  
  // remember to free the memory
  dst.delete();

});
export default router;

async function opencvGrayImageSave(image, path){
  cv.cvtColor(image, image, cv.COLOR_GRAY2RGBA, 0);
  let outputImage = new Jimp(image.cols, image.rows);
  outputImage.bitmap.data = image.data;
  outputImage.write(path);
  
}

function print2DArray(sub_image_array){
  const row_num = sub_image_array.length;
  const col_num = sub_image_array[0].length;

  if(row_num === 0 || col_num === 0)
    return console.log('Input is not a 2D array.')

  for (let i = 0; i < row_num; i++){
    let str = [];
    for (let j = 0; j < col_num; j++){
      str.push(sub_image_array[i][j])
    }
    str.push(sub_image_array[i].length);
    console.log(str.toString().replace(/,/g, ''));
  }
}

/*
let Float32 = new Float32Array;
float32 = Float32Array.from([1.0, 0.230, 0.36680]);

console.log(float32);
*/ 

/*
cv.mat:

"rows"
"cols"
"matSize"
"step"
"data"
"data8S"
"data16U"
"data16S"
"data32S"
"data32F"
"data64F"
"elemSize"
"elemSize1"
"channels"
"convertTo"
"total"
"row"
"create"
"rowRange"
"copyTo"
"type"
"empty"
"colRange"
"step1"
"clone"
"depth"
"col"
"dot"
"mul"
"inv"
"t"
"roi"
"diag"
"isContinuous"
"setTo"
"size"
"ptr"
"ucharPtr"
"charPtr"
"shortPtr"
"ushortPtr"
"intPtr"
"floatPtr"
"doublePtr"
"charAt"
"ucharAt"
"shortAt"
"ushortAt"
"intAt"
"floatAt"
"doubleAt"
"isAliasOf"
"delete"
"isDeleted"
"deleteLater"
*/

/*

router.get('/', async function(req, res, next) {
  //let image = await readFileAsync('../src/image/hwei.png');
  //const file = await fs.readFile('filename.txt', 'utf8');
  //await fs.writeFile('filename.txt', 'test');
  const imageDirPath = path.join(process.env.DIR_NAME, './src/image/');
  const readImagePath = path.join(imageDirPath, 'hwei.png');
  const writeImagePath = path.join(imageDirPath, 'output.png');
  
  const blurImage = 
    await sharp(readImagePath)
    .greyscale()
    .blur(5)
    .toBuffer()
    .catch(function (error) {
      return console.log(error);
    });
  const params = {
      gaussianBlur: 0.1,
      lowThreshold: 10,
      highThreshold: 30
  };
  const processdeImage 
  = await Image.load( blurImage )
    .then((img) => {
      const grey = img.grey();
      const edge = cannyEdgeDetector(grey, params);
      edge.save(writeImagePath);
      return edge.toBuffer();
    });

  const bufferImage 
  = await sharp(processdeImage)
    .png()
    .toBuffer()
    .catch(function (error) {
      return console.log(error);
    });
  /*
  await fs.writeFile(writeImagePath, processdeImage);
  
  res.sendFile(writeImagePath, function (err) {
    if (err) {
      next(err)
    } else {
      console.log('Sent processde image');
    }
  })
  res.send(bufferImage );
});
*/