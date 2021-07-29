import seq from 'sequelize';
const { Sequelize, DataTypes, Model } = seq;

const name = 'Tags';
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
        tag_name: {
          type: DataTypes.STRING,
          allowNull: false
        },
        ts: {
          type: Sequelize.BIGINT,
          defaultValue: sequelize.literal('extract(epoch from now())'),
          allowNull: false
        },
      }, {
        // Other model options go here

        // option to auto generate "updatedAt", "createdAt" columns.
        timestamps: false,
        //let table name will be equal to the model name.
        freezeTableName: true
    });
  console.log(`table "${name}" is defined.`);
  //This creates the table if it doesn't exist (and does nothing if it already exists).
  //model.sync({ force: true }) //: creates the table, dropping it first if it already existed.
    
  return model;
}

/**
 * list tags
 * @param {number} limit the limited number of tags will be listed.
 */
async function listTags(limit = 50){
  
  const sql = `
    SELECT t.tag_name
    FROM "Tags" t
    ORDER BY ts DESC
    LIMIT $1
  `;
  return db.any(sql, [limit]);
}

export{
  model,
  name,
  init,
  listTags,
}