const express=require('express')
const router=express.Router()
const adminauth=require('../controller/adminauth')
const{adminlogin}=require('../controller/render')

router.get('/',adminlogin)

// postinf
router.post('/',adminauth)


router.get('/dashbord',(req,res)=>{
    res.send("dashbord")
})


module.exports=router