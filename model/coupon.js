const mongoose=require('mongoose')


const coupen=mongoose.Schema({
    code:{
        type:String,trim:true
    },
    discount:{
        type:Number
    },
    expiryDate:{
        type:Date
    },
    status:{
        type:Boolean
    },
    min:{
        type:Number
    },
    max:Number
},{ timestamps: true })


module.exports=mongoose.model('coupon',coupen)