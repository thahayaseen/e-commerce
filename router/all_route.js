const {signup,otpvarify,resent,varifylogin,logout,viewproduct}=require("../controller/user/user")
const{register,login,otp,userhome}=require('../middleware/render')
// const plogin=require('../controller/user/ulogin')
const {pregister}=require('../middleware/redirect')
const {allproducts}=require('../controller/finding_all_admin')

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

router.get('/home',allproducts,userhome)

router.get('/product/:ids',viewproduct)




//logout

router.get('/logout',logout)







module.exports=router