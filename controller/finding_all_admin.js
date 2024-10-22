const User = require('../model/user_scema')
const Product = require('../model/product_schema')
const categories = require('../model/categories')


const alluser = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 6
        const skip = (page - 1) * limit;

        const user = await User.find().skip(skip).limit(limit)
        const totalProducts = await User.countDocuments();
        const totalPages = Math.ceil(totalProducts / limit);
        req.session.users = { user, totalPages, currentPage: page, limit: limit }
        next()
    } catch (error) {
        console.log(error);

    }
}

const allproducts = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        let categoryName = req.query.category || '';
        const query = req.query.search || '';
        const limit = parseInt(req.query.limit) || 6;
        const sort = req.query.sort || 'featured'; 
        const skip = (page - 1) * limit;

        let sortCondition = {};

        switch (sort) {
            case 'priceLowToHigh':
                sortCondition = { price: 1 };
                break;
            case 'priceHighToLow':
                sortCondition = { price: -1 };
                break;
            case 'averageRating':
                sortCondition = { rating: -1 };
                break;
            case 'newArrivals':
                sortCondition = { createdAt: -1 };
                break;
            case 'aToZ':
                sortCondition = { name: 1 };
                break;
            case 'zToA':
                sortCondition = { name: -1 };
                break;
            default:
                sortCondition = { featured: -1 };
        }

        if (categoryName === 'all') {
            categoryName = '';
        }

        let search = {};
        if (query) {
            search = { name: { $regex: `^${query}`, $options: 'i' } };
        }

        let categoryFilter = {};
        if (categoryName) {
            const category = await categories.findOne({ name: categoryName });
            if (category) {
                categoryFilter = { category_id: category._id };  
            } else {
                categoryFilter = { category_id: null };  
            }
        }

        let filterdata = { ...categoryFilter, ...search, unlist: false };
        console.log(filterdata);

        const products = await Product.find(filterdata)
            .populate('category_id')
            .sort(sortCondition)
            .skip(skip)
            .limit(limit);

        products.forEach(a => {
            console.log(a.name);
        });

        const categ = await categories.find();  

        req.session.categories = categ;
        req.session.products = products;
 
        const totalProducts = await Product.countDocuments({ ...filterdata, unlist: { $ne: true } }); 
        
        console.log(totalProducts);

        const totalPages = Math.ceil(totalProducts / limit);
        req.session.pagination = { totalPages, currentPage: page, limit: limit };

        next();

    } catch (error) {
        console.log(error);
        res.status(500).send('Server Error');
    }
};

const adproducts=async (req,res,next)=>{
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6
    const skip = (page - 1) * limit;
    
    const products = await Product.find()
    .populate('category_id')
    .skip(skip)
    .limit(limit)
    .sort({name:1})

    const categ = await categories
    .find()  
    .skip(skip)
    .limit(limit)
    .sort({name:1})
    req.session.categories = categ;

    req.session.aproducts = products;
    


    const totalProducts =await Product.countDocuments(); 
   console.log(totalProducts);
   
    
    const totalPages = Math.ceil(totalProducts / limit);
    req.session.pagination = { totalPages, currentPage: page, limit: limit };

next()
}
const categorydatas=async (req,res,next)=>{
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6
    const skip = (page - 1) * limit;
    const categ = await categories
    .find()  
    .skip(skip)
    .limit(limit)
    .sort({name:1})
    const totalProducts =await categories.countDocuments(); 
    req.session.categories = categ;

    const totalPages = Math.ceil(totalProducts / limit);

    req.session.pagination = { totalPages, currentPage: page, limit: limit };
next()
}
module.exports = { alluser, allproducts,adproducts,categorydatas }