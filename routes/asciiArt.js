import express from 'express';
import * as fs from 'fs/promises';
import path from 'path';
import cannyEdgeDetector from 'canny-edge-detector';
import Image_js from 'image-js';

import sharp from 'sharp';
import Jimp from 'jimp';

const Image = Image_js.Image;
var router = express.Router();
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

router.get('/', async function(req, res, next) {
  const kernal_zise = 9;
  const imageDirPath = path.join(process.env.DIR_NAME, './src/image/');
  const readImagePath = path.join(imageDirPath, 'hwei.png');
  const writeImagePath = path.join(imageDirPath, 'output.png');
  

  var jimpSrc = await Jimp.read(readImagePath);
  console.log(jimpSrc);
  // `jimpImage.bitmap` property has the decoded ImageData that we can use to create a cv:Mat
  //let src = cv.matFromImageData(jimpSrc.bitmap);
  let src = cv.matFromImageData(jimpSrc.bitmap);
  let dst = new cv.Mat();
  
  // src is read from .png file, it is encoded by RGBA
  cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
  //blur image
  let ksize = new cv.Size(kernal_zise, kernal_zise);
  cv.GaussianBlur(src, src, ksize, 0, 0, cv.BORDER_DEFAULT);
  // You can try more different parameters
  cv.Canny(src, dst, 50, 100, 3, false); 
  
  // transform dst to RGBA 
  cv.cvtColor(dst, dst, cv.COLOR_GRAY2RGBA, 0);
  var outputImage = new Jimp(dst.cols, dst.rows);
  outputImage.bitmap.data = dst.data;
  outputImage.write(writeImagePath);
  
  
  console.log(outputImage)
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