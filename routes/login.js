import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

let router = express.Router();

router.post('/', async function(req, res, next) {
    const {user_name, password} = req.body;
    if (!user_name || !password) {
        const err = new Error('user_name and password are required');
        err.status = 400;
        throw err;
    }
    sequelizeDB["Users"].find(user_name)
    .then(async function (user){
        let bcryptBool = await bcrypt.compare(password, user.password);
        return { bcryptBool , user };
    })
    .then(({bcryptBool, user})=> {
        if(!bcryptBool){
            res.json({ success: false, message: 'Authenticate failed. Wrong password'});
            return;
        }

        let jwt_data = {
            id: user.id,
            user_name: user.user_name,
            firstName: user.firstName,
            lastName: user.lastName,
        }
        let token = jwt.sign(jwt_data, process.env.SECRET, {
            expiresIn: 60*60*1
        });
        res.json({
            success: true,
            message: 'Get Authentication and JWT , pekopeko.',
            token: token
        });
        
    })
    .catch(function (error) {
        console.log(error);
        res.json({ success: false, message: 'Authenticate failed. User not found.'})
    });
    
});

export default router;