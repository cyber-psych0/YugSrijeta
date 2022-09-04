const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    fatherName: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    dob: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    pinCode: {
        type: Number,
        required: true
    },
    district: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    address: {
        type: String
    },
    profileImage: {
        type: String,
        required: true
    },
    email: {
        type: String
    },
    password: {
        type: String,
        required: true
    },
    regNo: {
        type: String,
        required: true
    },
    isApproved : {
        type: String,
        required: true
    },
    isAdmin : {
        type: Boolean,
        required: true
    }
})

module.exports = mongoose.model('User', userSchema)