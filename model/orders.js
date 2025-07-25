const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
orderid:{
  type:String
}
  ,user: {
    type: Schema.Types.ObjectId,
    ref: 'Users',  
    required: true
  },
  products: [
    {
      productid: {
        type: Schema.Types.ObjectId,
        ref: 'Product',  
        required: true
      },
      discount: {
        type: Number,
        default: 0
      },
      quantity: {
        type: Number,
        required: true,
        min: 1
      },
      price: {
        type: Number,
        required: true
      },
      status: {
        type: Boolean,
        default: true
      },
      return: {
        type: String,
        enum: ['Returned','Returning', 'CannotReturn', 'Return requsted','notrequst'],
        default: 'notrequst' 
      },
      returnReason: {
        type: String, 
        
      },
      returnExplanation: {
        type: String,
        required: function() {
          return this.return === 'Return requsted'; 
        }
      }
    }
  ],
  coupon: { 
    couponcode: String,
    discount: {
      type: Number,
      default: 0
    }
  },
  refund:{
    type:Number,
    default:0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  paymentMethod: {
    type: String,
    enum: ['onlinePayment', 'Cash on Delivery','wallet'],
    required: true
  },
 razorpay:{
  type:String
 }
 , paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed','waiting Payment','Refunded'],
    default: 'Pending'
  },
  pstatus: {
    type: Boolean,
    default: false
  },
  shippingAddress: {
    fullname: { type: String, required: true },
    addressline1: { type: String, required: true },
    addressline2: { type: String },
    city: { type: String, required: true },
    state: { type: String },
    zipcode: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String, required: true }
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  deliveryDate: {
    type: Date
  }
  ,shippingcharg:{
    type:Number,
    default:0
  }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
