const User=require('../model/user_scema')
const Product=require('../model/product_schema')


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
        const products=await Product.find()
        req.session.products=products
        next()
    }
    catch(error){
        console.log(error);
        
    }
}

module.exports={alluser,allproducts}