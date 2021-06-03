//import * as tf from '@tensorflow/tfjs';
import * as tf from '@tensorflow/tfjs-node';
import path from 'path';
const TFModelDirPath = path.join('file://',process.env.DIR_NAME, './src/deep_learning_model/');

console.log(path.join(TFModelDirPath,'3_layer_nn_456x6_rotate_batch100_neuron500_epoch40_js/model.json'))
let model = [];
model[0] = await tf.loadLayersModel('file://src/deep_learning_model/3_layer_nn_456x6_rotate_batch100_neuron500_epoch40_js/model.json');
model[1] = await tf.loadLayersModel('file://src/deep_learning_model/3_layer_nn_456x14_batch100_neuron500_epoch40_js/model.json');

export default model;