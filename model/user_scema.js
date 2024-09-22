const mongoose = require('mongoose')

const User=new mongoose.Schema({

    user_name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    phone:{
        type:Number,
        default:''
    },
    address:{
        type:Array,
        default:''
    },
    uotp:{
        type:Number,
        default:''
    },
    varify:{
        type:Boolean
    },
    isadmin:{
        type:Boolean,
        default:false
    }

},{timestamps:true})


module.exports=mongoose.model('users',User)