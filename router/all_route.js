const users=require("../controller/user_controler")
const{register,login,otp}=require('../controller/render')
const plogin=require('../controller/ulogin')
const {pregister}=require('../middleware/redirect')
const otps=require('../middleware/otpvarify')
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








module.exports=router