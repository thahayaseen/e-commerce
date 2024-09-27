const express=require('express')
const router=express.Router()
const {auth,accses,list,edit,deletion}=require('../controller/admin/admin')
const{adminlogin,admin,user,product}=require('../middleware/render')
const {alluser,allproducts}=require('../controller/finding_all_admin')
const nocach=require('../middleware/nocach')
const upload=require('../middleware/uplodimage')
const Product=require('../model/product_schema')
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



// /upload images 
// router.post('/product/images/:id', upload.array('productImages'),edit, (req, res) => {  // Should log an array of uploaded files
//     res.send('Files uploaded successfully');
// });

// delete product image 
router.post('/product/images/edit/:id',upload.array('productImages'), edit, deletion);



module.exports=router
