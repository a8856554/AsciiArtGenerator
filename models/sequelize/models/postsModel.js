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
    },
    width: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    height: {
      type: DataTypes.INTEGER,
      defaultValue: 0
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
 * @param {number} width the ascii art width (num of columns)
 * @param {number} height the ascii art height (num of rows)
 * @param {string} image_path image_path is the path post's image refered to.
 * @param {array} tags a array of tags. tags are strings.
 */
 async function createWithTags(user_id, title, context, width=0, height=0, image_path = '', tags = []){
  console.log(tags);

  if(width ===0 || height === 0){
    console.log("Please provide wid and height of the ascii art context.");
    return "Please provide wid and height of the ascii art context.";
  }

  let newPost = await model.create({ user_id: user_id, title: title, context: context, image_path:image_path , width:width, height:height});
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

/*

SELECT a,
       CASE WHEN a=1 THEN 'one'
            WHEN a=2 THEN 'two'
            ELSE 'other'
       END
    FROM test;


  INSERT INTO "Posts" (user_id,title, context ,image_path) 
    VALUES ('818bacf4-e564-4ab6-9557-5a14cafac644', 'raw sql test', 'pekopeko', '') RETURNING id;
 */


/**
 * list posts user searches.
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
 * list posts with tags user searches.
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
    where.push(`p.id < $${search_words.length + 1}`);

  const sql = `
    SELECT p.id, user_name, user_id, title, image_path, context, width, height, like_num, views, ts
    FROM "Posts" p INNER JOIN "Users" u
    ON p.user_id = u.id
    ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
    ORDER BY id DESC
    LIMIT 10
  `;
  let posts = await db.any(sql, [...search_words, start]);
  
  // if there is no record , return [].
  if(posts.length === 0)
    return [];
  
  let post_ids = [];
  for(let i = 0; i < posts.length; i++){
    post_ids.push(posts[i].id);
  }
  
  // For each post id, select tags correspond to it.
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



SELECT id, title, image_path, context, like_num, views, ts, user_id, tags
FROM "Posts" p LEFT JOIN (
  SELECT pt."PostId", string_agg(tag_name, ', ') as tags
  FROM "PostTags" pt INNER JOIN "Tags" t
    ON pt."TagId" = t.id 
      AND pt."PostId" IN(
        SELECT id FROM "Posts"
          WHERE title ILIKE '%peko%'
        ORDER BY id DESC
        LIMIT 20
      ) 
    GROUP BY pt."PostId"
    ORDER BY pt."PostId" DESC
  ) t
  ON p.id = t."PostId" 
  ORDER BY id DESC 
  LIMIT 20


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

EXPLAIN ANALYZE
SELECT p.id, user_name, user_id, title, image_path, context, width, height, like_num, views, ts
    FROM "Posts" p INNER JOIN "Users" u
    ON p.user_id = u.id
    WHERE p.title ILIKE '惠惠'
    ORDER BY id DESC
    LIMIT 10

EXPLAIN ANALYZE
SELECT p.id, user_name, user_id, title, image_path, context, width, height, like_num, views, ts
    FROM (SELECT * FROM "Posts" WHERE title ILIKE '惠惠') p INNER JOIN "Users" u
    ON p.user_id = u.id
    ORDER BY id DESC
    LIMIT 10
*/

/**
 * list posts by tags user searches.
 *
 * @param {array} search_tags a string array contains search tags.
 * @param {number} start start id of posts.
 */
async function listByTags(search_tags = [], start){
  let where = [];
  const element_num_limit = 10;

  if (search_tags.length > 0){
    for(let i = 0; i < search_tags.length; i++){
      where.push(`t.tag_name ILIKE '%$${i+1}:value%'`);
    }
  }

  // if number start exists, SELECT from id < start. The smaller the id is, the older the record is.
  if (start)
    where.push(`pt."PostId" < $${search_tags.length + 2}`);
  const sql = `
    SELECT p.id, user_name, user_id, title, image_path, context, width, height, like_num, views, ts
    FROM "Posts" p INNER JOIN "Users" u
    ON p.user_id = u.id
    WHERE p.id in(
      SELECT "PostId"
      FROM "PostTags" pt INNER JOIN "Tags" t
        ON pt."TagId" = t.id AND ${where.length ? where.join(' AND ') : ''}
      ORDER BY "PostId" DESC
      LIMIT $${search_tags.length + 1}
    )
    ORDER BY id DESC
  `;
  return db.any(sql, [...search_tags, element_num_limit, start]);
}

/**


SELECT * from "Posts"
WHERE id in(
  SELECT "PostId"
  FROM "PostTags" pt INNER JOIN "Tags" t
    ON pt."TagId" = t.id AND t.tag_name ILIKE '%peko%' AND pt."PostId" < 1010060
      ORDER BY "PostId" DESC
      LIMIT 3
)
ORDER BY id DESC



// find #peko tag in which posts.

SELECT *
  FROM "PostTags" pt INNER JOIN "Tags" t
    ON pt."TagId" = t.id AND t.tag_name ILIKE '%peko%' AND pt."PostId" < 1010060
      ORDER BY "PostId" DESC
      LIMIT 3
*/

/**
 * Delete a post by id
 * 
 * @param {number} post_id the id of the post user wants to delete
 */
async function deleteById(post_id){
  const sql = `
    DELETE FROM "PostTags" pt WHERE  pt."PostId" = $1;
    DELETE FROM "Posts" p WHERE  p.id = $1;
  `;
  return db.any(sql, [post_id]);
}

/**
 * find a post with post id.
 *
 * @param {string} id post id
 */
 async function find(id){
  return model.findOne({ where: { id: id } })
          .catch(function (error) {
              console.log('Posts.findOne() occurs error：' + error.message);
          });
}


export{
  model,
  name,
  create,
  createWithTags,
  init,
  list,
  listWithTags,
  listByTags,
  deleteById,
  find,
}

