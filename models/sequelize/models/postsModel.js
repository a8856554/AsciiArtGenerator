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
 * Create a post. user_id, title, context is needed.
 * @param {string} user_id user who creates this post.
 * @param {string} title post's title
 * @param {string} context post's context text
 * @param {string} image_path image_path is the path post's image refered to.
 * @param {array} tags a array of tags. tags are strings.
 */
 async function createWithTags(user_id, title, context, image_path = '', tags = []){
  console.log(tags);

  let newPost = await model.create({ user_id: user_id, title: title, context: context, image_path:image_path });
  if(tags.length === 0)
    return newPost;

  for(let i =0; i < tags.length; i++){
    let tagRecord = await sequelizeDB["Tags"].model.findOne({ where: { tag_name: tags[i] } })
    if(tagRecord)
      newPost.addTag(tagRecord);
    else
      newPost.createTag({tag_name : tags[i]});
  } 
  
  return newPost;
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
    LIMIT 20
  `;
  return db.any(sql, [...search_words, start]);
}

/**
 * list posts wit tags user searchs.
 *
 * @param {array} search_words a string array contains search words.
 * @param {number} start start id of posts.
 */
 async function listWithTags(search_words = [], start){
  
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
    LIMIT 20
  `;
  
  let posts = await db.any(sql, [...search_words, start]);
  
  // if there is no record , return [].
  if(posts.length === 0)
    return [];
  
  let post_ids = [];
  for(let i = 0; i < posts.length; i++){
    post_ids.push(posts[i].id);
  }
  
  const tag_sql = `
  SELECT pt."PostId", string_agg(tag_name, ',') as tags
    FROM "PostTags" pt INNER JOIN "Tags" t
      ON pt."TagId" = t.id AND pt."PostId" IN (${post_ids.join(',')})
      GROUP BY pt."PostId"
       ORDER BY pt."PostId" DESC;
  `
  
  let tags = await db.any(tag_sql);

  // Iterate posts and assign correct tags to it.
  let j = 0;
  for(let i = 0; i < posts.length; i++){
    if(posts[i].id === tags[j].PostId){
      posts[i].tags = tags[j].tags;
      j = j < tags.length-1 ? j + 1 : j;
    }
    else 
      posts[i].tags = "";    
  }

  return posts;
}
/*
`
SELECT pt."PostId", string_agg(tag_name, ', ') as tags
  FROM "PostTags" pt INNER JOIN "Tags" t
    ON pt."TagId" = t.id AND pt."PostId" IN (1010047, 1010048, 1010050)
    GROUP BY pt."PostId"
    ORDER BY pt."PostId" DESC;
`

`
SELECT pt."PostId", tag_name
  FROM "PostTags" pt INNER JOIN "Tags" t
    ON pt."TagId" = t.id AND pt."PostId" IN (1010047, 1010048, 1010050)
`

`
SELECT *
  FROM "PostTags" pt INNER JOIN "Tags" t
    ON pt."TagId" = t.id
`
*/
export{
  model,
  name,
  create,
  createWithTags,
  init,
  list,
  listWithTags,
}