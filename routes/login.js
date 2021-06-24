import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

let router = express.Router();

router.post('/', async function(req, res, next) {
    const {user_name, password} = req.body;
	//console.log(req);
    if (!user_name || !password) {
        return res.status(400).send({
					success: false,
					message: `user_name and password are not provided.`
				});
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
            type: 'access_token',
        }
        let token = jwt.sign(jwt_data, process.env.SECRET, {
            expiresIn: 60*60*1 //in seconds
        });

        let refresh_jwt_data = {
            id: user.id,
            user_name: user.user_name,
            firstName: user.firstName,
            lastName: user.lastName,
            type: 'refresh_token',
        }
        let refresh_token = jwt.sign(refresh_jwt_data, process.env.SECRET, {
            expiresIn: 60*60*24*3 //in seconds
        });
		
        // store refresh_token in cookies( httpOnly, sameSite)
        res.cookie('refresh_token', refresh_token, {
			maxAge: 60 * 60 * 1000 * 72, // 72 hour in ms
			httpOnly: true,
			secure: false,
			sameSite: true,
			path:'/',
		})
        res.json({
            success: true,
            message: 'Get Authentication and JWT , pekopeko.',
            access_token: token,
			id: user.id,
            user_name: user.user_name,
            firstName: user.firstName,
            lastName: user.lastName,
        });
        
    })
    .catch(function (error) {
        console.log(error);
        res.json({ success: false, message: 'Authenticate failed. User not found.'})
    });
    
});

export default router;