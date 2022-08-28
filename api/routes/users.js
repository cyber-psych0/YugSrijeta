const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const User = require('../models/user')
const jwt = require("jsonwebtoken")
const checkAuth = require('../middleware/check-auth')
require('dotenv').config();

const multer = require('multer');
const user = require('../models/user');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads/profileImages/');
    },
    filename: function(req, file, cb) {
        cb(null,  Math.floor(10000 + Math.random() * 90000).toString() + file.originalname.replaceAll(' ',''));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
        cb(null, true);
    }
    else {
        cb(new Error('Only JPEG, JPG and PNG images are allowed.'), false);
    }
}

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024*1024
    },
    fileFilter: fileFilter
});


router.get('/', async (req, res, next) => {
    try{
        const users = await User.find()
        res.status(200).json(users)
    }
    catch(err) {
        res.status(500).json({
            error: err
        })
    }
})

router.get('/:id', checkAuth, async (req, res) => {
    try{
        const user = await User.findOne({"adhaarNumber": req.params.id})
        if(!user){
            res.status(404).json({
                error: 'No users found!'
            })
        }
        else{
          const address = user.district + '(' + user.state + '), ' + 'PIN- ' + user.pinCode.toString();  
            res.status(200).json({
                name: user.name,
                fatherName: user.fatherName,
                phoneNumber: user.phoneNumber,
                adhaarNumber: user.adhaarNumber,
                address: address,
                profileImage: user.profileImage,
                regNo: user.regNo
            });
        }
    }
    catch(err) {
        res.status(500).json({
            error: err
        })
    }
})

router.post('/signup', async (req, res) => {
  const total = await User.countDocuments();
    user.find({adhaarNumber: req.body.adhaarNumber})
    .exec()
    .then(user => {
      if (user.length >= 1) {
        return res.status(409).json({
          message: "User with adhaar number alrready exists"
        });
      }
      else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({
              error: err
            });
          }
          else{
            const num = '00000' + total.toString();
            const regNum = req.body.district.toUpperCase().slice(0,4) +req.body.adhaarNumber.toString().slice(-4) + num.slice(-5);
            const user = new User({
              name: req.body.name,
              fatherName: req.body.fatherName,
              phoneNumber: req.body.phoneNumber,
              adhaarNumber: req.body.adhaarNumber,
              age: req.body.age,
              gender: req.body.gender,
              pinCode: req.body.pinCode,
              district: req.body.district,
              state: req.body.state,
              address: req.body.address || '',
              profileImage: req.body.profileImage,
              regNo: regNum,
              email: req.body.email || '',
              password: hash
            });
            user
              .save()
              .then(result => {
                const address = result.district + '(' + result.state + '), ' + 'PIN- ' + result.pinCode.toString();
                res.status(200).json({
                  name: result.name,
                  fatherName: result.fatherName,
                  phoneNumber: result.phoneNumber,
                  adhaarNumber: result.adhaarNumber,
                  address: address,
                  profileImage: result.profileImage,
                  regNo: result.regNo
                })
              })
              .catch(err => {
                res.status(500).json({
                  error: err
                });
              });
          }
        });
      }
    });
});

router.post("/login", (req, res, next) => {
    User.find({ adhaarNumber: req.body.adhaarNumber })
      .exec()
      .then(user => {
        if (user.length < 1) {
          return res.status(401).json({
            message: "Auth failed"
          });
        }
        bcrypt.compare(req.body.password, user[0].password, (err, result) => {
          if (err) {
            return res.status(401).json({
              message: "Auth failed"
            });
          }
          if (result) {
            const token = jwt.sign(
              {
                adhaarNumber: user[0].adhaarNumber,
                userId: user[0]._id
              },
              process.env.JWT_KEY,
              {
                  expiresIn: "1h"
              }
            );
            return res.status(200).json({
              message: "Auth successful",
              token: token
            });
          }
          res.status(401).json({
            message: "Auth failed"
          });
        });
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({
          error: err
        });
      });
});
  

module.exports = router