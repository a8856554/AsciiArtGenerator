const schemaSql = `
  CREATE INDEX posts_idx_ts ON "Posts" USING btree(ts);
  CREATE INDEX posts_idx_text ON "Posts" USING gin(title gin_trgm_ops);

`;
/*PostgreSQL automatically creates an index for each unique constraint
and primary key constraint to enforce uniqueness. 
Thus, it is not necessary to create an index explicitly for primary key columns.*/


const insertQuery = `
  INSERT INTO "Posts" ("title","image_path","context","ts","user_id") 
    VALUES ('pekopeko','123/123','asciiart', 1623579854,'818bacf4-e564-4ab6-9557-5a14cafac644');
  
  INSERT INTO "Posts" ("title","image_path","context","ts","user_id") 
  SELECT
    'pekopeko'|| i || ' ' || (i+1),
    '123/123',
    'asciiart',
    round(extract(epoch from now()) + (i - 1000000) * 60.0),
    '818bacf4-e564-4ab6-9557-5a14cafac644'
    FROM generate_series(1, 1000000) AS s(i);
`;

const explainAnalyze = `
EXPLAIN ANALYZE SELECT * FROM “Posts” WHERE title ILIKE ‘%peko300000%’;
EXPLAIN ANALYZE SELECT * FROM “Posts” WHERE ts > 1605577083 AND ts < 1605583083;
`;
export default schemaSql;