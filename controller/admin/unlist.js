const Product = require('../../model/product_schema');

const toggleListStatus = async (req, res, next) => {
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

module.exports = toggleListStatus;
