const express = require('express');
const helmet = require("helmet");
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const userRouter = require('./api/routes/users');
const uploadRouter = require('./api/routes/uploads');

//handle CORS Policy to avoid CORS error
app.use(cors());
app.use(helmet());

app.use('/uploads/profileImages/', express.static('uploads/profileImages'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());



const url = 'mongodb://localhost/yugsrijeta_users'
mongoose.connect(url, {useNewUrlParser: true})

//handle requests for /users endpoint
app.use('/users', userRouter)

//handle requests for /upload endpoint
app.use('/upload',uploadRouter);

//handle error if different route is sent
app.use((req,res,next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
})

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
})

module.exports = app;