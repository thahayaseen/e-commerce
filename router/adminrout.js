const express=require('express')
const router=express.Router()
const adminauth=require('../controller/admin/adminauth')
const{adminlogin,admin,user}=require('../middleware/render')
const users=require('../controller/admin/users_admin')
const {block,unblock}=require('../controller/admin/block_unblock')
const nocach=require('../middleware/nocach')
router.get('/',nocach,adminlogin)

// postinf
router.post('/',nocach,adminauth)


// dashbord 
router.get('/dashbord',nocach,admin)

router.get('/users',users,user)
//user block and unblock 
router.get('/users/block/:id',nocach,block)
router.get('/users/unblock/:id',nocach,unblock)

module.exports=router