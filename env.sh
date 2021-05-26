echo 'Setting up environment variables...'
# In windows10 gitbash npm start, add this line to prevent chinese garbled text.
cmd //C "chcp 65001"
# NODE_ENV chould be 'development', 'staging', or'production'
export NODE_ENV=development
export PG_HOSTNAME=localhost
export PG_PORT=5432
export PG_USERNAME=postgres
export PG_USERPASSPORT=a32156
export PG_DB_NAME=gmaildb
# PG_SECRET is for login JWT.
export PG_SECRET=GFEtrwbQ48BTR
# PG_SALT_ROUNDS is for bcrypt.
export PG_SALT_ROUNDS=10
echo 'Done'