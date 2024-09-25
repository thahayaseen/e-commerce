const {signup,otpvarify,resent,varifylogin,logout}=require("../controller/user/user")
const{register,login,otp}=require('../middleware/render')
// const plogin=require('../controller/user/ulogin')
const {pregister}=require('../middleware/redirect')
// const otps=require('../controller/user/otpvarify')
// const resendotp=require('../controller/user/resendotp')
// const logout=require('../controller/logout')
// const potp=require('../controller/sendotp')
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


//logout

router.get('/logout',logout)







module.exports=router