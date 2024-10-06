const mongoose = require('mongoose')

const User=new mongoose.Schema({
    name:{
        type:String
    },
    user_name:{
        type:String,
        unique:false
      
    },
    email:{
        type:String,
        // required:true
    },
    googleId:{
        type:String
    }
    ,
    password:{
        type:String,
        // required:true
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
        type:Boolean,
        default:false
    },
    isadmin:{
        type:Boolean,
        default:false
    }
    ,
    blocked:{
        type:Boolean,
        default:false
    }
    

},{timestamps:true})


module.exports=mongoose.model('Users',User)