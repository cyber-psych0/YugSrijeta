const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const User = require('../models/user')
const jwt = require("jsonwebtoken")
const checkAuth = require('../middleware/check-auth')
require('dotenv').config();

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
        const user = await User.findOne({"phoneNumber": req.params.id})
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
                address: address,
                profileImage: user.profileImage,
                regNo: user.regNo,
                dob: user.dob
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
    User.find({phoneNumber: req.body.phoneNumber})
    .exec()
    .then(user => {
      if (user.length >= 1) {
        return res.status(409).json({
          message: "User with mobile number already exists"
        });
      }
      else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({
              message: 'cannot create hash',
              error: err
            });
          }
          else{
            const num = '00000' + total.toString();
            const stateCodes = {
              "Andaman and Nicobar Islands": "AN",
              "Andhra Pradesh": "AP",
              "Arunachal Pradesh": "AR",
              "Assam":"As",
              "Bihar":"BR",
              "Chandigarh":"CG",
              "Chhattisgarh":"CH",
              "Dadra and Nagar Haveli":"DN",
              "Daman and Diu":"DD",
              "Delhi":"DL",
              "Goa":"GA",
              "Gujarat":"GJ",
              "Haryana":"HR",
              "Himachal Pradesh":"HP",
              "Jammu and Kashmir":"JK",
              "Jharkhand":"JH",
              "Karnataka":"KA",
              "Kerala":"KL",
              "Ladakh":"LA",
              "Lakshadweep":"LD",
              "Madhya Pradesh":"MP",
              "Maharashtra":"MH",
              "Manipur":"MN",
              "Meghalaya": "ML",
              "Mizoram":"MZ",
              "Nagaland": "NL",
              "Odisha":"OR",
              "Puducherry":"PY",
              "Punjab":"PB",
              "Rajasthan":"RJ",
              "Sikkim":"SK",
              "Tamil Nadu":"TN",
              "Telangana":"TS",
              "Tripura":"TR",
              "Uttar Pradesh":"UP",
              "Uttarakhand":"UK",
              "West Bengal":"WB"
          };
          const regNum = stateCodes[req.body.state] + '-' + req.body.district.toUpperCase().slice(0,4)  + '-' + num.slice(-5);
            const myUser = new User({
              name: req.body.name,
              fatherName: req.body.fatherName,
              phoneNumber: req.body.phoneNumber,
              dob: req.body.dob,
              gender: req.body.gender,
              pinCode: req.body.pinCode,
              district: req.body.district,
              state: req.body.state,
              profileImage: req.body.profileImage,
              regNo: regNum,
              password: hash,
              isApproved: 'pending',
              isAdmin: false,
              address: '',
              email: ''
            });
            if(req.body.address) {
              myUser.address = req.body.address;
            }
            if(req.body.email) {
              myUser.email = req.body.email;
            }
            myUser
              .save()
              .then(result => {
                res.status(200).json({
                  message: "User Registered Successfully"
                })
              })
              .catch(err => {
                res.status(500).json({
                  message: 'error while saving user',
                  error: err
                });
              });
          }
        });
      }
    });
});

router.post("/login", (req, res, next) => {
    User.find({ phoneNumber: req.body.phoneNumber })
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
                phoneNumber: user[0].phoneNumber,
                userId: user[0]._id
              },
              process.env.JWT_KEY,
              {
                  expiresIn: "1h"
              }
            );
            return res.status(200).json({
              message: "Auth successful",
              token: token,
              isApproved: user[0].isApproved,
              isAdmin: user[0].isAdmin
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

router.get('/approve/:id', async (req, res) => {
  try{
      const user = await User.findOne({"phoneNumber": req.params.id});
      if(!user){
          res.status(404).json({
              error: 'No users found!'
          })
      }
      else{
        const query = { phoneNumber: user.phoneNumber },
          newvalues = { $set: { isApproved: "approved" } };
        User.updateOne(query, newvalues, function(err, resp) {
          if(err) {
            throw err;
          }
          res.status(200).json({
            message: "User Approved!"
          });
        });
      }
  }
  catch(err) {
      res.status(500).json({
          message: 'Failed to approve user',
          error: err
      })
  }
});

router.get('/reject/:id', async (req, res) => {
  try{
      const user = await User.findOne({"phoneNumber": req.params.id})
      if(!user){
          res.status(404).json({
              error: 'No users found!'
          })
      }
      else{
        const query = { phoneNumber: user.phoneNumber },
          newvalues = { $set: { isApproved: "rejected" } };
        User.updateOne(query, newvalues, function(err, resp) {
          if(err) {
            throw err;
          }
          res.status(200).json({
            message: "User Rejected!"
          });
        });
      }
  }
  catch(err) {
      res.status(500).json({
          message: 'Failed to reject user',
          error: err
      })
  }
})


module.exports = router