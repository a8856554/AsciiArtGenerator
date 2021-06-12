
/**
  * Add relations between sequlize tables.
  * @param {object} db an object contains sequlize models.
  * 
  */
async function applyExtraSetup(db) {
	 
    let Users = db["Users"].model;
    let Posts = db["Posts"].model;
    // Posts has a UserId column which stores Users id
    // target = Users
    Users.hasMany(Posts, {foreignKey: 'user_id'});
    //Posts.belongsTo(Users, {foreignKey: 'user_id'}); // Adds user_id to Posts // 屬於
}

export default applyExtraSetup;