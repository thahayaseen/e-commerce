const mongoose = require('mongoose')

const User = new mongoose.Schema({
    name: {
        type: String
    },
    user_name: {
        type: String,
        unique: false

    },
    email: {
        type: String,
        // required:true
    },
    googleId: {
        type: String
    }
    ,
    password: {
        type: String,
       
    },
    phone: {
        type: Number,
        default: ''
    },
    address: {
        type: [mongoose.Schema.ObjectId],
        ref: 'Address',

    },
    uotp: {
        type: Number,
        default: ''
    },
    varify: {
        type: Boolean,
        default: false
    },
    isadmin: {
        type: Boolean,
        default: false
    },
    orders: {
        type: [mongoose.Types.ObjectId]

    },
    blocked: {
        type: Boolean,
        default: false
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date


}, { timestamps: true })


module.exports = mongoose.model('Users', User)