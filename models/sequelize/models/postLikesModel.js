import seq from 'sequelize';
import pgPromise from 'pg-promise';

const { Sequelize, DataTypes, Model } = seq;
if (!global.db) {
  const pgp = pgPromise({});
  global.db = pgp(process.env.DB_URL);
}

const name = 'PostLikes';
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
    ts: {
      type: Sequelize.BIGINT,
      defaultValue: sequelize.literal('extract(epoch from now())'),
      allowNull: false
    },
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
 * find a postlike with post id and user id
 *
 * @param {string} post_id post id
 * @param {string} user_id user id
 */
 async function find( post_id, user_id){
  return model.findOne({ where: { post_id: post_id,  user_id: user_id} })
          .catch(function (error) {
              console.log('PostLikes.findOne() occurs error：' + error.message);
          });
}

/**
 * Create a like with post_id and user_id 
 *
 * @param {string} post_id post id
 * @param {string} user_id user id
 */
async function create( post_id, user_id){
  model.create({ post_id: post_id,  user_id: user_id });
}

/**
 * Delete a like
 * 
 * @param {string} post_id post id
 * @param {string} user_id user id
 */
 async function deleteLike(post_id, user_id){
  const sql = `
    DELETE FROM "PostLikes" pl WHERE  pl.post_id = $1 AND pl.user_id = $2;
  `;
  return db.any(sql, [post_id, user_id])
  .catch(function (error) {
    console.log('PostLikes.delete occurs error：' + error.message);
  });
}
export{
  model,
  name,
  init,
  find,
  create,
  deleteLike,
}