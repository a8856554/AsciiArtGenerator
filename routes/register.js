import express from 'express';
import bcrypt from 'bcrypt';

let router = express.Router();

router.post('/', async function(req, res, next) {
    const {user_name, password} = req.body;
    if (!user_name || !password) {
        const err = new Error('user_name and password are required');
        err.status = 400;
        throw err;
    }

    let user = await sequelizeDB["Users"].find(user_name);
    if(user){
        console.log(user);
        res.send('The user name has already existed.');
        return;
    }

    let hash;
    try {
        hash = await bcrypt.hash(password, Number(process.env.PG_SALT_ROUNDS));
    } catch (e) {
        console.log("caught error", e); 
        res.status(500).json({ success: false, message: `A error occurs during bcrypt password : ${error}`});
        return;
    }
    
    if(!hash)
        return;
    sequelizeDB["Users"].create(user_name, hash)
    .then(post => {
        //res.json(post);
        res.send('register successfully.');
    }).catch(next);
    
});

export default router;