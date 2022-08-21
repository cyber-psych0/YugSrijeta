const express = require('express')
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose')

const userRouter = require('./api/routes/users');

app.use('/uploads/profileImages/', express.static('uploads/profileImages'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

const url = 'mongodb://localhost/yugsrijeta_users'
mongoose.connect(url, {useNewUrlParser: true})
// const con = mongoose.connection

// con.on('open', function(){
//     console.log('connected....')
// })
// app.use(express.json())

//handle CORS Policy to avoid CORS error
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
})

//handle requests for /users endpoint
app.use('/users', userRouter)

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