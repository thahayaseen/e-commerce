const User = require('../model/user_scema')
const Product = require('../model/product_schema')
const categories = require('../model/categories')


const alluser = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 3
        const skip = (page - 1) * limit;

        const user = await User.find().skip(skip).limit(limit)
        const totalProducts = await User.countDocuments();
        const totalPages = Math.ceil(totalProducts / limit);
        req.session.users = {user,totalPages, currentPage: page, limit: limit}
        next()
    } catch (error) {
        console.log(error);

    }
}
// const allproducts=async (req,res,next)=>{
//     try{
//         const products=await Product.find().populate('category_id')
//         // console.log('prod',products)
//         const categ=await categories.find()

//         req.session.categories=categ
//         req.session.products=products
//         next()
//     }
//     catch(error){
//         console.log(error);

//     }
// }
const allproducts = async (req, res, next) => {
    try {

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6;
        const sort = req.query.sort || 'featured'; // Default to 'featured' if no sort parameter is passed
        const skip = (page - 1) * limit;
        
        // Sorting conditions based on the 'sort' parameter
        let sortCondition = {};
        
        switch (sort) {
            case 'priceLowToHigh':
                sortCondition = { price: 1 }; // Ascending order (low to high)
                break;
            case 'priceHighToLow':
                sortCondition = { price: -1 }; // Descending order (high to low)
                break;
            case 'averageRating':
                sortCondition = { rating: -1 }; // Highest ratings first
                break;
            case 'newArrivals':
                sortCondition = { createdAt: -1 }; // Most recent first
                break;
            case 'aToZ':
                sortCondition = { name: 1 }; // Alphabetical order (A-Z)
                break;
            case 'zToA':
                sortCondition = { name: -1 }; // Reverse alphabetical order (Z-A)
                break;
            default:
                sortCondition = { featured: -1 }; // Default sorting by featured
        }
        
        // Fetch paginated products with sorting
        const products = await Product.find()
            .populate('category_id')
            .sort(sortCondition)
            .skip(skip)
            .limit(limit); 
        
        const categ = await categories.find();
        
        req.session.categories = categ;
        req.session.products = products;
        
        const totalProducts = await Product.countDocuments();
        const totalPages = Math.ceil(totalProducts / limit);
        req.session.pagination = { totalPages, currentPage: page, limit: limit };
        
        next();
        
    } catch (error) {
        console.log(error);
        res.status(500).send('Server Error');
    }
};

module.exports = { alluser, allproducts }