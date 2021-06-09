//import * as tf from '@tensorflow/tfjs';
import * as tf from '@tensorflow/tfjs-node';
import path from 'path';
const TFModelDirPath = path.join('file://',process.env.DIR_NAME, './src/deep_learning_model/');

console.log(path.join(TFModelDirPath,'3_layer_nn_456x6_rotate_batch100_neuron500_epoch40_js/model.json'))
/**
 * Creates an Object contains tensorflow models.
 * 
 */
let model = {};
model["nn_0"] = await tf.loadLayersModel('file://src/deep_learning_model/3_layer_nn_456x6_rotate_batch100_neuron500_epoch40_js/model.json');
model["nn_1"] = await tf.loadLayersModel('file://src/deep_learning_model/3_layer_nn_456x14_batch100_neuron500_epoch40_js/model.json');
model["cnn_0"] = await tf.loadLayersModel('file://src/deep_learning_model/cnn_3layer25_456x6_batch50_bn_gap_epoch40_noVal_colab_js/model.json');
export default model;