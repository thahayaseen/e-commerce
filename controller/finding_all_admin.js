const User=require('../model/user_scema')
const Product=require('../model/product_schema')
const categories=require('../model/categories')


const alluser= async (req,res,next)=>{
try {
    const user=await User.find()
    req.session.users=user
    next()
} catch (error) {
    console.log(error);
    
}
}
const allproducts=async (req,res,next)=>{
    try{
        const products=await Product.find().populate('category_id')
        // console.log('prod',products)
        const categ=await categories.find()
        
        req.session.categories=categ
        req.session.products=products
        next()
    }
    catch(error){
        console.log(error);
        
    }
}

module.exports={alluser,allproducts}