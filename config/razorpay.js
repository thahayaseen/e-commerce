const razorpay=require('razorpay')
require('dotenv').config()

const razor=new razorpay({
    key_id:process.env.RAZORPAY_KEY_ID,
    key_secret:'7byRiDAbidtlMdri5CQSTFsq'
})

module.exports=razor