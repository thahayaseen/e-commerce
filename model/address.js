const mongoose =require('mongoose')


const address=mongoose.Schema({
    userid:{
        type:mongoose.Schema.ObjectId,
        ref:'User'
    },
    fullname:{
        type:String,

    },
    addressline1:{
        type:String
    },
    addressline2:{
        type:String
    },
    city:{
        type:String
    },
    state:{
        type:String
    },
    zipcode:{
        type:String
    },
    country:{
        type:String
    },
    phone:{
        type:String
    },
    addrestype:{
        type:String
    }
})


module.exports = mongoose.model('Address',address)