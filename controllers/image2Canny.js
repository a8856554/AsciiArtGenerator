
/**
  * generate a canny image from input image by opencv.
  * @param {ImageBitmap} srcImage an image (Bitmap) you want to transform to canny image.
  * @param {number} image_width the width you want to resize input image to.
  * @param {number} character_pix the pixel of a ascii character's width and height.
  * @param {number} kernal_zise kernel size for blur function.
  * 
  * @return {cv.mat} a canny image (cv.mat).
  */
export default function image2Canny(srcImage, image_width, character_pix = 30, kernal_zise){
  let src = cv.matFromImageData(srcImage);
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
  
  // remember to free the memory
  src.delete();

  return dst;
}