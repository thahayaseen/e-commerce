const mongoose=require('mongoose')

const offer=mongoose.Schema({
    name:{
        type:String,trim:true

    },
    applicationType:{
        type:String,
        enum:['product','category','all']
    },
    discountType:{
        type:String,
        enum:['fixed','percentage']
    },
    discountValue:{
        type:Number
    },
   
    isActive:{
        type:Boolean,
        default:true
       
    },
    validFrom:{
        type:Date
    },
    validUntil:{
        type:Date
    },
    selectedItems: {
        type:[String]
    }
       
    
    
},{timestamps:true})

module.exports=mongoose.model('offers',offer)