const { signup, otpvarify, resent, varifylogin, logout, viewproduct, blockuser, glogincb, cartitemspush, cartupdata, cartitemdelete, addaddress, placeorder, deleteaddress, cancelorder, editname, changepass, productstockdata, cancelitem,patchwishlist,removewish,coupenapplaying,razorpayvarify } = require("../controller/user/user")
const { register, login, otp, userhome, productlist, myaccount, userdash, useraddress, oredrs, cartrender, checkout,wishlist } = require('../middleware/render')
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


// otp 
router.get('/otp', otp)
router.post('/otp', otpvarify)



// resendotp 
router.post('/resendotp', resent)

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
router.patch('/orders/:id', cancelorder)
//addres edit and update
router.post('/address', addaddress)
router.patch('/address/update/:id')
router.patch('/address/:id', deleteaddress)

//user data update

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