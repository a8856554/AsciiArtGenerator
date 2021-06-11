import Sequelize from 'sequelize';
import applyExtraSetup from './extraSetup.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const sequelize = new Sequelize(process.env.DB_URL);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const basename = path.basename(__filename);
const db = {};
let models_path = path.join(__dirname, 'models/');

async function loadModelAsync(models_path){
  let file_list = await fs.readdir(models_path);

  //check files are valid.
  file_list.filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })

  // async import each sequelize model and wait promises finishing.
  let promise_array = [];
  for(let i = 0; i < file_list.length; i++ ){
    promise_array.push(importModelAsync(file_list[i]));
  }
  await Promise.all(promise_array);

  await applyExtraSetup(db);

  Object.keys(db).forEach(modelName => {
    //sync() every model
    db[modelName].model.sync();
  });

  db.sequelize = sequelize;
  db.Sequelize = Sequelize;
}

async function importModelAsync(file){
  
  let model = await import(path.join('file://',models_path, file));
  let m = await model.init(sequelize);
  db[model.name] = model;
  //db[model.name].model = m;
}
  
/*
fs
  .readdirSync(models_path)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(async (file) => {
    let model = await import(path.join(models_path, file));
    let m = model.init(sequelize);
    db[model.name] = model;
    db[model.name].model = m;
  });
*/

loadModelAsync(models_path);

export default db;