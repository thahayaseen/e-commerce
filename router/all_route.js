const users=require("../controller/user/user_controler")
const{register,login,otp}=require('../middleware/render')
const plogin=require('../controller/user/ulogin')
const {pregister}=require('../controller/redirect')
const otps=require('../controller/user/otpvarify')
const resendotp=require('../controller/user/resendotp')
const logout=require('../controller/logout')
// const potp=require('../controller/sendotp')
const express=require('express')
const router=express.Router()


router.get('/signup',register)
router.post('/signup',users,pregister)
router.get('/signin',login)
router.post('/signin',plogin)


// otp 
router.get('/otp',otp)
router.post('/otp',otps)



// resendotp 
router.post('/resendotp',resendotp)


//logout

router.get('/logout',logout)







module.exports=router