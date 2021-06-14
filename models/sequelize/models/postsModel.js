import seq from 'sequelize';
import pgPromise from 'pg-promise';

const { Sequelize, DataTypes, Model } = seq;
if (!global.db) {
  const pgp = pgPromise({});
  global.db = pgp(process.env.DB_URL);
}

const name = 'Posts';
let model = {};
/**
  * Init the Sequelize table model.
  * @param {Sequelize} sequelize a Sequelize instance.
  * 
  * @return {ModelCtor} a Sequelize model represents the database table.
  */
function init( sequelize){
  
  model = sequelize.define(name, {
    // Model attributes are defined here
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true // Automatically gets converted to SERIAL for postgres
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    image_path: {
      type: DataTypes.STRING,
      allowNull: true
    },
    context: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    like_num: {
      type: DataTypes.INTEGER, //32 bits interger
      defaultValue: 0
    },
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    ts: {
      type: Sequelize.BIGINT,
      defaultValue: sequelize.literal('extract(epoch from now())'),
      allowNull: false
    }
    
    }, {
      // Other model options go here

      // auto generate "updatedAt", "createdAt" columns.
      timestamps: false,  

      //let table name will be equal to the model name.
      freezeTableName: true
    }
  );
  console.log(`table "${name}" is defined.`);
  //This creates the table if it doesn't exist (and does nothing if it already exists).
  //model.sync({ force: true }) //: creates the table, dropping it first if it already existed.
    
  return model;
}

/**
 * Create a post. user_id, title, context is needed.
 * @param {string} user_id user who creates this post.
 * @param {string} title post's title
 * @param {string} context post's context text
 * @param {string} image_path image_path is the path post's image refered to.
 * 
 */
async function create(user_id, title, context, image_path = ''){
  return model.create({ user_id: user_id, title: title, context: context, image_path:image_path });
}

/**
 * list posts user searchs.
 *
 * @param {array} search_words a string array contains search words.
 * @param {number} start start id of posts.
 */
async function list(search_words = [], start){
  const where = [];
  if (search_words.length > 0){
    for(let i = 0; i < search_words.length; i++){
      where.push(`title ILIKE '%$${i+1}:value%'`);
    }
  }
  
  // if number start exists, SELECT from id < start. The smaller the id is, the older the record is.
  if (start)
    where.push(`id < $${search_words.length + 1}`);
  const sql = `
    SELECT *
    FROM "Posts"
    ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
    ORDER BY id DESC
    LIMIT 3
  `;
  return db.any(sql, [...search_words, start]);
}

export{
  model,
  name,
  create,
  init,
  list,
}