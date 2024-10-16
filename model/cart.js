const mongoose = require('mongoose')


const cart = new mongoose.Schema({

    userid: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    
  coupon:{ 
    couponcode:String,
    discount:{
      type:Number,
      default:0
    }
  
  }
  ,
    product: [
        {
            productid: {
                type: mongoose.Schema.ObjectId,
                ref: 'Product'
            },
            quantity: {
                type: Number,
                min: 1
            },
            price:{
                type:Number
            }
        }
    ],
    totalprice:{
        type:Number,
        default:0
    }
}, { timestamps: true })

cart.pre('save', function (next) {
    let totalprice = 0;
  
    this.product.forEach(item => {
        totalprice += item.quantity * item.price;
    });
  
    this.totalprice = totalprice;
  
    next();
  });

const cartschema = mongoose.model('Cart', cart)
module.exports = cartschema