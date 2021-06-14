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
import usersRouter from './routes/users.js';
import asciiArtRouter from './routes/asciiArt.js';
import registerRouter from './routes/register.js';
import loginRouter from './routes/login.js';
import postsRouter from './routes/posts.js'

import tensorflowModel from './src/javascript/loadTFModel.js';
import tokenVerify from './middleware/tokenVerify.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
//process.env.DIR_NAME = __dirname;

const corsOptions = {
    origin: [
        'http://localhost:3000',
      'http://localhost:3002',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization'],
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

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/asciiArt', asciiArtRouter);
app.use('/register', registerRouter);
app.use('/login', loginRouter);
app.use('/posts', postsRouter);

app.use(tokenVerify);
app.use(cors(corsOptions));

const port = 3000;
app.listen(port, () => {
    console.log(`Server is up and running on port ${port}...`);
});