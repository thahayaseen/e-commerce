const express=require('express')
const router=express.Router()
const {auth,accses,list}=require('../controller/admin/admin')
// const adminauth=require('../controller/admin/adminauth')
const{adminlogin,admin,user,product}=require('../middleware/render')
const {alluser,allproducts}=require('../controller/finding_all_admin')
// const {block,unblock}=require('../controller/admin/block_unblock')
const nocach=require('../middleware/nocach')
// const unlist=require('../controller/product/unlist')
router.get('/',nocach,adminlogin)

// postinf
router.post('/',nocach,auth)


// dashbord 
router.get('/dashbord',nocach,admin)

router.get('/users',alluser,user)
//user block and unblock 
router.patch('/users/accses/:id',nocach,accses)
// router.get('/users/unblock/:id',nocach,unblock)
//products
router.get('/product',allproducts,product)


//product delete and unlist and edit
router.post('/product/edit/:id')
router.patch('/product/unlist/:id',list)


module.exports=router