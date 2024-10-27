const { signup, otpvarify, resent, varifylogin, logout, viewproduct, blockuser, glogincb, cartitemspush, cartupdata, cartitemdelete, addaddress, placeorder, deleteaddress, cancelorder, editname, changepass, productstockdata, cancelitem,patchwishlist,removewish,coupenapplaying,razorpayvarify,sendreset,resetpage,resetpasspost,returning,addressave } = require("../controller/user/user")
const { register, login, otp, userhome, productlist, myaccount, userdash, useraddress, oredrs, cartrender, checkout,wishlist,resetpass,walletrender, } = require('../middleware/render')
// const plogin=require('../controller/user/ulogin')
const { pregister } = require('../middleware/redirect')
const { allproducts } = require('../controller/finding_all_admin')
const passport = require('passport');
const gauth = require('../controller/gauth');
const express = require('express')
const router = express.Router()


router.get('/signup', register)
router.post('/signup', signup, pregister)
router.get('/signin', login)
router.post('/signin', varifylogin)

router.get('/resetpass',resetpass )
router.post('/reset',sendreset )

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
// router.post('/user/cancel-product', cancelitem)

router.patch('/orders/:id', cancelorder)
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
//addres edit and update
router.post('/address', addaddress)
router.patch('/address/update',addressave)
router.delete('/address/:id', deleteaddress)
router.post('/return/:proid',returning)
//user data update
// wallet 
router.get('/user/wallet',walletrender)
router.patch('/userupdate', editname)
router.patch('/changepass', changepass)

// wishlist 
router.get('/wishlist',wishlist)
router.patch('/wishlist/remove',removewish)
router.patch('/wishlist/:id',patchwishlist)

router.get('/applaycoupon/:name',coupenapplaying)


router.get('/glogin/callback', glogincb);
//razorpay varify
router.post('/verify-payment',razorpayvarify);



//logout


router.get('/logout', logout)







module.exports = router