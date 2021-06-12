import DeepLearningStrategy from '../models/stragegy/deeplearning/DeepLearningStrategy.js'

/**
  * A class generate ascii characters by different machine learning strategy .
  * @constructor
  * @param {DeepLearningStrategy} strategy 
  */
function AsciiGenerator(strategy){
  this.strategy = strategy;
}

/**
  * generate ascii characters from input image .
  * @param {cv.mat} srcImage a canny image (cv.mat) you want to transform to ascii.
  * @param {number} character_pix the pixel of a ascii character's width and height.
  * 
  * @return {Array} an array contains ascii characters.
  */
AsciiGenerator.prototype.generate = function(srcImage, character_pix) {
  return this.strategy.generateAscii(srcImage, character_pix);
}
export default AsciiGenerator;

//@param {string} model_name the name of deep learning model you want to apply. ex: "cnn_0"