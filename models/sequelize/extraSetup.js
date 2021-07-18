
import seq from 'sequelize';
const { Sequelize, DataTypes} = seq;
/**
  * Add relations between sequlize tables.
  * @param {object} db an object contains sequlize models.
  * @param {object} db an object contains sequlize models.
  */
async function applyExtraSetup(db, sequelize) {
	 
    let Users = db["Users"].model;
    let Posts = db["Posts"].model;
    let Tags = db["Tags"].model;
    let PostLikes = db["PostLikes"].model;

    const PostTags = sequelize.define('PostTags', {
        PostId: {
          type: DataTypes.INTEGER,
          references: {
            model: Posts, 
            key: 'id'
          }
        },
        TagId: {
          type: DataTypes.INTEGER,
          references: {
            model: Tags, 
            key: 'id'
          }
        }
      }, {
        // option to auto generate "updatedAt", "createdAt" columns.
        timestamps: false,
        //let table name will be equal to the model name.
        freezeTableName: true
      }
    );
    

    try {
      // Posts has a user_id column which stores Users id
      Users.hasMany(Posts, {foreignKey: 'user_id'});

      // PostLikes has user_id and post_id column which stores Users id and Posts id seperately.
      Users.hasMany(PostLikes, {foreignKey: 'user_id'});
      Posts.hasMany(PostLikes, {foreignKey: 'post_id'});


      //Posts.sync({ alter: true });
      Tags.belongsToMany(Posts, { through: PostTags });
      Posts.belongsToMany(Tags, { through: PostTags });
      sequelize.sync();

    } catch(err) {
      console.log(err)
    }
    
    //Posts.belongsTo(Users, {foreignKey: 'user_id'}); // Adds user_id to Posts // 屬於
    //db["Users"].model.sync();
    //db["Posts"].model.sync();
}

export default applyExtraSetup;