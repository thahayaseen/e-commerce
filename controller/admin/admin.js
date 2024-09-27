const User=require('../../model/user_scema')
const Product = require('../../model/product_schema');
const path = require('path');
const fs=require('fs')

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



const list = async (req, res, next) => {
  try {
    const id = req.params.id;
    
    // Find the product by ID
    const product = await Product.findById(id);
    
    // Check if the product exists
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.unlist = !product.unlist;
    
    // Save the updated product list
    await product.save();
    
    // Return success response with the updated status
    return res.status(200).json({
      success: true,
      newStatus: product.unlist,
      message: `Product ${product.unlist ? 'listed' : 'unlisted'} successfully.`,
    });
  } catch (error) {
    console.error('Error updating product status:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};


const edit = async (req, res, next) => {
    try {
        const id = req.params.id;
        const data = await Product.findById(id);
        
        const files = req.files; // Get uploaded files from 'multer'

        if (files.length > 0) {
            files.forEach(file => {
                data.images.push(file.filename); // Push new image filenames into the array
            });
        }
        await data.save(); // Save the updated product
        next();
    } catch (error) {
        console.error('Error in edit section:', error);
        res.status(500).json({ success: false, message: 'Failed to update images.' });
    }
};

const deletion = async (req, res) => {
    const productId = req.params.id;
    const { productName, productCategory, productDescription } = req.body; // Get other form fields

    try {
        // Find the product by ID
        const product = await Product.findById(productId);
        const deletedImages = JSON.parse(req.body.deletedImages); // Parse deleted images

        // Update the product fields
        product.name = productName;
        product.category = productCategory;
        product.description = productDescription;

        // Remove deleted images from product's image array
        if (deletedImages && deletedImages.length > 0) {
            product.images = product.images.filter(image => !deletedImages.includes(image));

            // Delete the images from the server's file system
            deletedImages.forEach(image => {
                const imagePath = path.join(__dirname, '..','..', 'public', 'uploads', image);
                // console.log(imagePath);
                
                fs.unlink(imagePath, (err) => {
                    if (err) {
                        console.error(`Failed to delete image file: ${imagePath}`);
                    }
                });
            });
        }

        // Save the updated product back to the database
        await product.save();
        // res.redirect('/admin/product')

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ success: false, message: 'Failed to update product.' });
    }
}


module.exports={auth,accses,list,edit,deletion}