const express = require('express')
const router = express.Router()
const { auth, accses, list, padd, savecat, imageadding, submitedit, useredit, categoryunlist, updateorder, getiingorderdetials,addcoupen,coupenedit,deletecupen, } = require('../controller/admin/admin')
const { adminlogin, admin, user, product, catagory, orders,coupenrender,offerpage,datatoedit } = require('../middleware/render')
const { alluser, adproducts,categorydatas } = require('../controller/finding_all_admin')
const {exportpdf,exportexcel,invoice}=require('../controller/product/productUtils.controller')
const nocach = require('../middleware/nocach')
const upload = require('../middleware/uplodimage')
const Product = require('../model/product_schema')
const coupon = require('../model/coupon')
const {deleteoffers,offers}=require('../controller/product/offer.controller')
const { returnadmin } = require('../controller/product/product.controller')
router.get('/', nocach, adminlogin)

// postinf
router.post('/', nocach, auth)


// dashbord 
router.get('/dashboard', nocach, admin)
router.get('/exporttopdf',exportpdf)
router.get('/exporttoexcel',exportexcel)



router.get('/users', alluser, user)
//user block and unblock 
router.patch('/users/accses/:id', nocach, accses)
// router.get('/users/unblock/:id',nocach,unblock)
//products
router.get('/product', adproducts, product)


//product delete and unlist and edit
// router.post('/product/edit/:id')
router.patch('/product/unlist/:id', list)
//submit edited data

router.patch('/product/edit/:id', upload.array('dhsh'), submitedit)

router.patch('/product/images/edit/:id', upload.array('croppedImage'), imageadding);

//add product
router.post('/product/add', upload.array('addimage'), padd)

router.post('/order/:orderid/:product/:action',returnadmin)
router.get('/category', categorydatas, catagory)
// coupen 
router.get('/coupon',coupenrender)
router.post('/coupon',addcoupen)
router.put('/coupon/:id',coupenedit)
router.delete('/coupon/:id',deletecupen)


// add category 
router.post('/category/add', savecat)
router.patch('/category/edit/:id', useredit)
router.patch('/category/unlist/:id', categoryunlist)

router.get('/offers',offerpage)
router.get('/offers/:id',datatoedit )
router.post('/offers/delete/:id',deleteoffers   )
router.post('/offers/save',offers)
// orders section 
router.get('/orders', orders)
router.patch('/orders', updateorder)
router.get('/orderlist/:id', getiingorderdetials)




module.exports = router
