import express from 'express';
import * as fs from 'fs/promises';
import path from 'path';
import cannyEdgeDetector from 'canny-edge-detector';
import Image_js from 'image-js';
import * as tf from '@tensorflow/tfjs-node';
import sharp from 'sharp';
import Jimp from 'jimp';

const Image = Image_js.Image;
var router = express.Router();


router.get('/', async function(req, res, next) {
  const kernal_zise = 11;
  const character_pix = 30;
  const imageDirPath = path.join(process.env.DIR_NAME, './src/image/');
  const readImagePath = path.join(imageDirPath, 'hwei.png');
  const writeImagePath = path.join(imageDirPath, 'output.png');
  const predict_image_size = [1,character_pix*character_pix];
  const image_width = 30*70;
  var jimpSrc = await Jimp.read(readImagePath);
  //console.log(jimpSrc);
  // `jimpImage.bitmap` property has the decoded ImageData that we can use to create a cv:Mat
  let src = cv.matFromImageData(jimpSrc.bitmap);
  let dst = new cv.Mat();

  let multiple = image_width / src.cols;
  //resize image, 1st parameter in cv.Size is col, 2nd is row.
  let dsize = new cv.Size( 
    Math.floor(src.cols * multiple) , 
    Math.floor(src.rows * multiple)
  );
  cv.resize(src, src, dsize, 0, 0, cv.INTER_AREA);

  //crop image, 1st parameter in cv.Rect is col shift, 2nd is row shift,
  //            3rd is col size, 4th is row size.
  const col_num = Math.floor((src.cols/character_pix));
  const row_num = Math.floor((src.rows/character_pix));
  let rect = new cv.Rect(
    0, 0, 
    Math.floor(col_num * character_pix), 
    Math.floor(row_num * character_pix)
  );
  src = src.roi(rect);
  
  // src is read from .png file, it is encoded by RGBA
  cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);

  // blur image
  let ksize = new cv.Size(kernal_zise, kernal_zise);
  cv.GaussianBlur(src, src, ksize, 0, 0, cv.BORDER_DEFAULT);

  // generate canny image to dst.
  cv.Canny(src, dst, 50, 100, 3, false); 
  
  let sub_image_array = new Array(row_num);
  for (let i = 0; i < row_num; i++) {
    sub_image_array[i] = new Array(col_num);
    for (let j = 0; j < col_num; j++) {
      let rect = new cv.Rect(j*character_pix, i*character_pix, character_pix, character_pix);
      let sub_image = dst.roi(rect);
      // gray to rgb to gray, if use gray image directly will occur bug.
      cv.cvtColor(sub_image, sub_image, cv.COLOR_GRAY2RGB, 0);
      cv.cvtColor(sub_image, sub_image, cv.COLOR_RGB2GRAY, 0);
      
      let input = tf.tensor2d(sub_image.data, predict_image_size, 'float32').div(tf.scalar(255));
      if(input.sum().dataSync()[0] < 5){
        sub_image_array[i][j] = ' ';
      }
      else{
        // Run inference with predict().
        let one_hot = tfModel[0].predict(input, predict_image_size);
        sub_image_array[i][j] = String.fromCharCode(35 + one_hot.argMax(1).dataSync()[0]);
      }
      
        
        //opencvGrayImageSave(sub_image, path.join(imageDirPath,'test/' ,`${i}_${j}.png`));
      
        
    }
  }
  
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
  
  
  //console.log(outputImage)
  outputImage.getBuffer(Jimp.MIME_PNG, (err, result)=>{
    res.set('Content-Type', Jimp.MIME_PNG);
    res.send(result);
    // remember to free the memory
    src.delete(); 
    dst.delete();
  });
  //res.sendFile(writeImagePath);
});
export default router;

async function opencvGrayImageSave(image, path){
  cv.cvtColor(image, image, cv.COLOR_GRAY2RGBA, 0);
  let outputImage = new Jimp(image.cols, image.rows);
  outputImage.bitmap.data = image.data;
  outputImage.write(path);
  
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