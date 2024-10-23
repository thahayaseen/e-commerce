const mongoose =require('mongoose')


const wishlist=mongoose.Schema({
    userid:{
        type:mongoose.Schema.ObjectId
    },
    productid:{
        type:[mongoose.Schema.ObjectId],
        ref:'Product'
        
    }
},{timestamps:true})

module.exports=mongoose.model('wishlist',wishlist)