const { signup, viewproduct, blockuser,  cartitemspush, cartupdata, cartitemdelete, addaddress,  deleteaddress, editname, changepass, productstockdata,  patchwishlist, removewish, coupenapplaying,  sendreset, resetpage, resetpasspost, addressave,  } = require("../controller/user/user")
const { register, login, otp, userhome, productlist, myaccount, userdash, useraddress, oredrs, cartrender, checkout, wishlist, resetpass, walletrender, placedorder } = require('../middleware/render')
// const {invoice}=require('../controller/product/productUtils.controller')
const { pregister } = require('../middleware/redirect')
const { allproducts } = require('../controller/finding_all_admin')
const {cancelitem,cancelorder,paymentfaied,placeorder,razorpayvarify,   retrypayment,returning}=require('../controller/user/order.controller')
const {glogincb,logout,otpvarify,resent,varifylogin}=require('../controller/user/auth.controller')
const passport = require('passport');
const gauth = require('../controller/gauth');
const express = require('express');
const cart = require("../model/cart");
const { generateInvoice } = require("../controller/product/sales-report-service")
const router = express.Router()
router.get('/signup', register)
router.post('/signup', signup, pregister)
router.get('/signin', login)
router.post('/signin', varifylogin)

router.get('/resetpass', resetpass)
router.post('/reset', sendreset)
router.use(async(req,res,next)=>{
   const userid=req.session.ulogin
   if(userid){
    const cartitem=await cart.findOne({userid:userid})
    console.log('wallet is');
    console.log(cartitem.product)
    console.log(cartitem.product.length)
   req.cartcount=cartitem.product.length
next()
    
   }else{
    next()
   }
})

// otp 
router.get('/otp', otp)
router.post('/otp', otpvarify)
// resendotp 
router.post('/resendotp', resent)
router.get('/reset-password/:token', resetpage);
// Route to update the password
router.post('/reset-password/:token', resetpasspost);
// user side 
router.get('/', blockuser, allproducts, userhome)
router.get('/product/:ids', blockuser, allproducts, viewproduct)
router.get('/productstock/:id', productstockdata)
router.get('/product', blockuser, allproducts, productlist)
//user dashbord 
router.get('/user/myaccount', myaccount)
router.get('/user/mydash', userdash)
router.get('/user/address', useraddress)
router.get('/user/orders', oredrs)
router.post('/user/cancel-product', cancelitem)
router.get('/download-invoice/:orderid', generateInvoice)

// router.patch('/orders/:id', cancelorder)
//google validation
router.get('/glogin',
    passport.authenticate('google', { scope: ['email', 'profile'] })
);

//cart section product
router.get('/cart', cartrender)
router.post('/cart', cartitemspush)
router.patch('/cart/update/:cartid', cartupdata)
router.delete('/cart/delete', cartitemdelete)

//checkout page 
router.get('/checkout', checkout)
router.post('/orders', placeorder)
router.get('/orderplaced', placedorder)
//addres edit and update
router.post('/address', addaddress)
router.patch('/address/update', addressave)
router.delete('/address/:id', deleteaddress)
router.post('/return/:proid', returning)
//user data update
// wallet 
router.get('/user/wallet', walletrender)
router.patch('/userupdate', editname)
router.patch('/changepass', changepass)

// wishlist 
router.get('/wishlist', wishlist)
router.patch('/wishlist/remove', removewish)
router.patch('/wishlist/:id', patchwishlist)

router.get('/applaycoupon/:name', coupenapplaying)


router.get('/glogin/callback', glogincb);
//razorpay varify
router.post('/verify-payment', razorpayvarify);
router.patch('/payment-failed/:id', paymentfaied);
router.post('/retrypayment/:id', retrypayment)


//logout


router.get('/logout', logout)







module.exports = router