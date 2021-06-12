import seq from 'sequelize';
const { Sequelize, DataTypes, Model } = seq;

const name = 'Users';
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
          type: Sequelize.UUID,
          primaryKey: true,
          defaultValue: Sequelize.UUIDV4
        },
        user_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        first_name: {
          type: DataTypes.STRING
        },
        last_name: {
          type: DataTypes.STRING
          // allowNull defaults to true
        },
        email: {
          type: DataTypes.STRING
          // allowNull defaults to true
        }
      }, {
        // Other model options go here
    
        //let table name will be equal to the model name.
        freezeTableName: true
    });
  console.log(`table "${name}" is defined.`);
  //This creates the table if it doesn't exist (and does nothing if it already exists).
  //model.sync({ force: true }) //: creates the table, dropping it first if it already existed.
    
  return model;
}


/**
 * Create a user with his user_name and password 
 *
 * @param {string} user_name User's name of the new user
 * @param {string} password User's password of the new user
 */
async function create(user_name, password){
  model.create({ user_name: user_name, password: password });
}

/**
 * find a user whose name is tha same as user_name.
 *
 * @param {string} user_name User's name of the user
 */
async function find(user_name){
  return model.findOne({ where: { user_name: user_name } })
          .catch(function (error) {
              console.log('Users.findOne() occurs error：' + error.message);
          });
}

/**
 * Get all ids in table "Users".
 * Return a array of number.
 * @param {Sequelize} sequelize a sequelize instance.
 */
async function getAllUserId(sequelize){
  let object_array = await sequelize.query(`SELECT id from "Users";`);
  object_array = object_array[0];

  let id_array = [];
  let len = object_array.length;
  for(let i = 0; i < len; i = i+1)
    id_array.push(object_array[i].id);

  return id_array;
  /*
  return model.findAll({
    attributes: ['id']
  });*/
  /*
  const sql = `
        SELECT id
        FROM "Users"
    ;`;
  return db.any(sql);*/
}

/* 
 async function getAllUserTokenNRoutine(){
  const sql = `
    SELECT "RoutineNotifications"."UserId",
    "RoutineNotifications".time_interval, "RoutineNotifications".time_last_search,
    "RoutineNotifications".filtering_word0, "RoutineNotifications".filtering_word1, "RoutineNotifications".filtering_word2, "RoutineNotifications".filtering_word3, "RoutineNotifications".filtering_word4,
    "GmailTokens".access_token, "GmailTokens".refresh_token, "GmailTokens".scope,
    "GmailTokens".token_type, "GmailTokens".expiry_date
    FROM "RoutineNotifications" INNER JOIN "GmailTokens"
    ON "RoutineNotifications"."UserId" = "GmailTokens"."UserId"
  ;`;
  return db.any(sql);
}*/

export{
  model,
  name,
  create,
  init,
  find,
  getAllUserId,
}
