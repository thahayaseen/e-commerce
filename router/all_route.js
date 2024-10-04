const {signup,otpvarify,resent,varifylogin,logout,viewproduct,blockuser,glogincb}=require("../controller/user/user")
const{register,login,otp,userhome,productlist}=require('../middleware/render')
// const plogin=require('../controller/user/ulogin')
const {pregister}=require('../middleware/redirect')
const {allproducts}=require('../controller/finding_all_admin')
const passport = require('passport');
const gauth = require('../controller/gauth'); 
const express=require('express')
const router=express.Router()


router.get('/signup',register)
router.post('/signup',signup,pregister)
router.get('/signin',login)
router.post('/signin',varifylogin)


// otp 
router.get('/otp',otp)
router.post('/otp',otpvarify)



// resendotp 
router.post('/resendotp',resent)

// user side 

router.get('/home',blockuser,allproducts,userhome)

router.get('/product/:ids',blockuser,allproducts,viewproduct)

router.get('/product',blockuser,allproducts,productlist)

//google validation
router.get('/glogin', 
    passport.authenticate('google', { scope: ['email', 'profile'] })
);


router.get('/glogin/callback',glogincb);


//logout

router.get('/logout',logout)







module.exports=router