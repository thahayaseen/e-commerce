const express=require('express')
const router=express.Router()
const adminauth=require('../controller/adminauth')
const{adminlogin,admin,user}=require('../controller/render')
const users=require('../controller/users_admin')
router.get('/',adminlogin)

// postinf
router.post('/',adminauth)


// dashbord 
router.get('/dashbord',admin)

router.get('/users',users,user)


module.exports=router