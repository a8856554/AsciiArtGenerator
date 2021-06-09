import * as tf from '@tensorflow/tfjs-node';
import DeepLearningStrategy from './DeepLearningStrategy.js';

/*
let nnStragegy = {

  generateAscii : function(srcImage, character_pix, model_name){

    const predict_image_size = [1,character_pix*character_pix];
    const col_num = Math.floor((srcImage.cols/character_pix));
    const row_num = Math.floor((srcImage.rows/character_pix));

    let sub_image_array = new Array(row_num);
    for (let i = 0; i < row_num; i++) {
      sub_image_array[i] = new Array(col_num);
      for (let j = 0; j < col_num; j++) {
        let rect = new cv.Rect(j*character_pix, i*character_pix, character_pix, character_pix);
        let sub_image = srcImage.roi(rect);
        // gray to rgb to gray, if use gray image directly will occur bug.
        cv.cvtColor(sub_image, sub_image, cv.COLOR_GRAY2RGB, 0);
        cv.cvtColor(sub_image, sub_image, cv.COLOR_RGB2GRAY, 0);
        
        // image data should be devided by 255, so its value would be in 0 ~ 1.
        let input = tf.tensor2d(sub_image.data, predict_image_size, 'float32').div(tf.scalar(255));
        if(input.sum().dataSync()[0] < 5){
          sub_image_array[i][j] = ' ';
        }
        else{
          // Run inference with predict().
          let one_hot = tfModel[model_name].predict(input, predict_image_size);
          sub_image_array[i][j] = String.fromCharCode(35 + one_hot.argMax(1).dataSync()[0]);
        }
      }
    }

    return sub_image_array;
  }
};

let cnnStragegy = {

  generateAscii : function(srcImage, character_pix, model_name){

    const predict_image_size = [1,character_pix,character_pix,1];
    const col_num = Math.floor((srcImage.cols/character_pix));
    const row_num = Math.floor((srcImage.rows/character_pix));

    let sub_image_array = new Array(row_num);
    for (let i = 0; i < row_num; i++) {
      sub_image_array[i] = new Array(col_num);
      for (let j = 0; j < col_num; j++) {
        let rect = new cv.Rect(j*character_pix, i*character_pix, character_pix, character_pix);
        let sub_image = srcImage.roi(rect);
        // gray to rgb to gray, if use gray image directly will occur bug.
        cv.cvtColor(sub_image, sub_image, cv.COLOR_GRAY2RGB, 0);
        cv.cvtColor(sub_image, sub_image, cv.COLOR_RGB2GRAY, 0);
        
        // image data should be devided by 255, so its value would be in 0 ~ 1.
        let input = tf.tensor4d(sub_image.data, predict_image_size, 'float32').div(tf.scalar(255));
        if(input.sum().dataSync()[0] < 5){
          sub_image_array[i][j] = ' ';
        }
        else{
          // Run inference with predict().
          let one_hot = tfModel[model_name].predict(input, predict_image_size);
          sub_image_array[i][j] = String.fromCharCode(35 + one_hot.argMax(1).dataSync()[0]);
        }
      }
    }

    return sub_image_array;
  }
};

let tensorflowStrategy = {
  "nn" : nnStragegy,
  "cnn" : cnnStragegy
};
*/
class nnStragegy extends DeepLearningStrategy{

  generateAscii(srcImage, character_pix){
    // override
    super.generateAscii(srcImage, character_pix);

    const predict_image_size = [1,character_pix*character_pix];
    const col_num = Math.floor((srcImage.cols/character_pix));
    const row_num = Math.floor((srcImage.rows/character_pix));

    let sub_image_array = new Array(row_num);
    for (let i = 0; i < row_num; i++) {
      sub_image_array[i] = new Array(col_num);
      for (let j = 0; j < col_num; j++) {
        let rect = new cv.Rect(j*character_pix, i*character_pix, character_pix, character_pix);
        let sub_image = srcImage.roi(rect);
        // gray to rgb to gray, if use gray image directly will occur bug.
        cv.cvtColor(sub_image, sub_image, cv.COLOR_GRAY2RGB, 0);
        cv.cvtColor(sub_image, sub_image, cv.COLOR_RGB2GRAY, 0);
        
        // image data should be devided by 255, so its value would be in 0 ~ 1.
        let input = tf.tensor2d(sub_image.data, predict_image_size, 'float32').div(tf.scalar(255));
        if(input.sum().dataSync()[0] < 5){
          sub_image_array[i][j] = ' ';
        }
        else{
          // Run inference with predict().
          let one_hot = tfModel[this.model_name].predict(input, predict_image_size);
          sub_image_array[i][j] = String.fromCharCode(35 + one_hot.argMax(1).dataSync()[0]);
        }
      }
    }

    return sub_image_array;
  }
}

class cnnStragegy extends DeepLearningStrategy{

 generateAscii(srcImage, character_pix){
  // override
  super.generateAscii(srcImage, character_pix);
  const predict_image_size = [1,character_pix,character_pix,1];
  const col_num = Math.floor((srcImage.cols/character_pix));
  const row_num = Math.floor((srcImage.rows/character_pix));

  let sub_image_array = new Array(row_num);
  for (let i = 0; i < row_num; i++) {
    sub_image_array[i] = new Array(col_num);
    for (let j = 0; j < col_num; j++) {
      let rect = new cv.Rect(j*character_pix, i*character_pix, character_pix, character_pix);
      let sub_image = srcImage.roi(rect);
      // gray to rgb to gray, if use gray image directly will occur bug.
      cv.cvtColor(sub_image, sub_image, cv.COLOR_GRAY2RGB, 0);
      cv.cvtColor(sub_image, sub_image, cv.COLOR_RGB2GRAY, 0);
      
      // image data should be devided by 255, so its value would be in 0 ~ 1.
      let input = tf.tensor4d(sub_image.data, predict_image_size, 'float32').div(tf.scalar(255));
      if(input.sum().dataSync()[0] < 5){
        sub_image_array[i][j] = ' ';
      }
      else{
        // Run inference with predict().
        let one_hot = tfModel[this.model_name].predict(input, predict_image_size);
        sub_image_array[i][j] = String.fromCharCode(35 + one_hot.argMax(1).dataSync()[0]);
      }
    }
  }

  return sub_image_array;  

  }
}
let tensorflowStrategies = {
  "nn" : nnStragegy,
  "cnn" : cnnStragegy
};
export default tensorflowStrategies ;