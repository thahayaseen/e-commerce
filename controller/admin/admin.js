const User=require('../../model/user_scema')
// admin authentication 
const auth=async (req,res,next)=>{
    try {
        const { username,password }= req.body
    console.log(username+ password);
    
    const exsist=await User.findOne({
        $and:[
            {user_name:username},
            {password:password},
        ]
    })
    if(exsist){
        req.session.ladmin=true
        if(exsist.isadmin){
           return res.redirect('/admin/dashbord')
        }
        else {
        req.session.admin='The entered usename and password not a admin'
        return res.redirect('/admin')
        }
    }
    
    } catch (error) {
        console.log(error);
        
    }
    

}


// admin side user block and unblock 
const accses = async (req, res, next) => {
    try {
        const user_id = req.params.id
        console.log(user_id+'userid');
        
        const detials = await User.findById(user_id)
        if(!detials){
            return res.status(404).json({message:'user not found'})
        }
        detials.status = !detials.status
        await detials.save()
        
        res.status(200).json({
            success:true,
            udata:detials.status,
            message:'user status updated successfully'
        })

    }
    catch (error) {
        console.log(error);

    }
}




// const unblock=async (req,res,next)=>{
//     try {
//         user_id=req.params.id
//     const detials=await User.findById(user_id)

//     detials.status=true
//     await detials.save()


//     return  res.redirect('/admin/users')

//     } catch (error) {
//        console.log(error);
        
//     }
   
// }
const Product = require('../../model/product_schema');

const list = async (req, res, next) => {
  try {
    const id = req.params.id;
    
    // Find the product by ID
    const product = await Product.findById(id);
    
    // Check if the product exists
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.status = !product.status;
    
    // Save the updated product status
    await product.save();
    
    // Return success response with the updated status
    return res.status(200).json({
      success: true,
      newStatus: product.status,
      message: `Product ${product.status ? 'listed' : 'unlisted'} successfully.`,
    });
  } catch (error) {
    console.error('Error updating product status:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};

module.exports={auth,accses,list}