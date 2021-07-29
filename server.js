import config from './config.js';
import express from 'express';
import cors from 'cors';
import createError from 'http-errors';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import * as cv from './src/javascript/opencv.js';
import sequelizeDB  from './models/sequelize/index.js';

import indexRouter from './routes/index.js';
import userRouter from './routes/user.js';
import asciiArtRouter from './routes/asciiArt.js';
import registerRouter from './routes/register.js';
import loginRouter from './routes/login.js';
import postsRouter from './routes/posts.js';
import taggedPostsRouter from './routes/taggedPosts.js';
import accessTokenRouter from './routes/accessToken.js';
import accessTokenAuthRouter from './routes/accessTokenAuthentication.js';
import tagsRouter from './routes/tags.js';

import tensorflowModel from './src/javascript/loadTFModel.js';
import tokenVerify from './middleware/tokenVerify.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
//process.env.DIR_NAME = __dirname;

const corsOptions = {
    origin: [
        'http://localhost:3000',
      'http://localhost:3002',
      'http://asciiartgenerator-dev.ap-east-1.elasticbeanstalk.com',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization'],
	credentials: true,
};

if (!global.cv) {
  global.cv = cv;
}

if(!global.tfModel){
  global.tfModel = tensorflowModel
}

if (!global.sequelizeDB) {
  global.sequelizeDB  = sequelizeDB;
}

const app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors(corsOptions));


app.use(express.static(path.join(__dirname, 'build'), {
  setHeaders: (res, path, stat) => {
      res.set('Cache-Control', 'public, s-maxage=86400');
  }
}));

app.get('/*', function (request, response){
  response.sendFile(path.join(__dirname, 'build', 'index.html'))
});

app.use('/api', indexRouter);
app.use('/api/asciiArt', asciiArtRouter);
app.use('/api/register', registerRouter);
app.use('/api/login', loginRouter);
app.use('/api/posts', postsRouter);
app.use('/api/taggedPosts', taggedPostsRouter);
app.use('/api/accessToken', accessTokenRouter);
app.use('/api/tags', tagsRouter);

app.use(tokenVerify);
app.use('/api/user', userRouter);
app.use('/api/accessTokenAuth', accessTokenAuthRouter);



const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is up and running on port ${port}...`);
});