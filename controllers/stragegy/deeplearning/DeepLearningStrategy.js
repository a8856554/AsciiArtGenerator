class DeepLearningStrategy{
  /**
   * 
   * @param {string} model_name the deep learning model's name. eg: "cnn_0" 
   */
  constructor(model_name){
      this.model_name = model_name;
  }
  /**
  * generate ascii characters from input canny image by tensorflow model.
  * @param {cv.mat} srcImage a canny image (cv.mat) you want to transform to ascii.
  * @param {number} character_pix the pixel of a ascii character's width and height.
  * 
  * @return {Array} an array contains ascii characters.
  */
  generateAscii(srcImage, character_pix){

  }
}

export default DeepLearningStrategy;