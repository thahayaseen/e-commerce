const express=require('express')
const router=express.Router()
const {auth,accses,list,padd,savecat,imageadding,submitedit,useredit,categoryunlist}=require('../controller/admin/admin')
const{adminlogin,admin,user,product,catagory}=require('../middleware/render')
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
//submit edited data

router.patch('/product/edit/:id',upload.array('dhsh'),submitedit)

router.patch('/product/images/edit/:id',upload.array('croppedImage'), imageadding);

//add product
router.post('/product/add',upload.array('addimage'),padd)
// router.post('/product/add', upload.array('addimage'), (req, res) => {
//     // Access uploaded images via req.files
//     console.log(req.files); // This will log all the uploaded images
//     // Handle the uploaded files here
//     res.json({ success: true });
// });

router.get('/category',allproducts,catagory)



// add category 
router.post('/category/add',savecat)
router.patch('/category/edit/:id',useredit)
router.patch('/category/unlist/:id',categoryunlist)

module.exports=router
