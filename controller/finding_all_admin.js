const User = require('../model/user_scema')
const Product = require('../model/product_schema')
const categories = require('../model/categories')


const alluser = async (req, res, next) => {
    try {
        const filter = req.query.search
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 6
        const skip = (page - 1) * limit;
        let filterobjs = {}
        if (typeof filter == 'string' && filter.length > 0) {
            filterobjs['user_name'] = new RegExp(`${filter}`, 'i')
        }
        const user = await User.find(filterobjs).skip(skip).limit(limit)
        console.log(user, filter, filterobjs);

        const totalProducts = await User.countDocuments(filterobjs);
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
                sortCondition = { name: 1 };
        }

        if (categoryName === 'all') {
            categoryName = '';
        }

        let search = {};
        if (query) {
            search = { name: { $regex: `${query}`, $options: 'i' } };
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

const adproducts = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 4;
        const skip = (page - 1) * limit;
        console.log(limit, 'lins');

        const { q, status } = req.query;

        // Build dynamic search query
        const searchQuery = {};

        // Text search on product name or code (adjust field names if needed)
        if (q) {
            searchQuery.$or = [
                { name: { $regex: q, $options: 'i' } },
                { code: { $regex: q, $options: 'i' } } // only if product has `code` field
            ];
        }

        // Status filter if your products have an isActive field
        if (status) {
            searchQuery.isActive = status === 'active';
        }

        // Get paginated and filtered products
        const products = await Product.find(searchQuery)
            .populate('category_id')
            .sort({ name: 1 }) // you can adjust sorting as needed
            .skip(skip)
            .limit(limit);

        // Get category list (optional: paginate or not)
        const categ = await categories
            .find()
            .sort({ name: 1 });

        // Total product count for pagination
        const totalProducts = await Product.countDocuments(searchQuery);
        const totalPages = Math.ceil(totalProducts / limit);

        // Set session data or req data to pass to next middleware
        req.session.categories = categ;
        req.session.aproducts = products;
        req.session.pagination = {
            total: totalProducts,
            totalPages,
            currentPage: page,
            limit: limit
        };

        next();
    } catch (err) {
        console.error('Error in adproducts middleware:', err);
        next(err); // pass to error handler
    }
};

const categorydatas = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6;
        const skip = (page - 1) * limit;
        const { q } = req.query;

        // Build search query
        const searchQuery = {};
        if (q) {
            searchQuery.name = { $regex: q, $options: "i" }; // case-insensitive name match
        }

        // Fetch filtered & paginated categories
        const categ = await categories
            .find(searchQuery)
            .sort({ name: 1 })
            .skip(skip)
            .limit(limit);

        // Total count for filtered result
        const totalCategories = await categories.countDocuments(searchQuery);

        const totalPages = Math.ceil(totalCategories / limit);

        // Store in session
        req.session.categories = categ;
        req.session.pagination = {
            total: totalCategories,
            totalPages,
            currentPage: page,
            limit,
            q, // optional, for preserving search state
        };

        next();
    } catch (err) {
        console.error("Error fetching filtered categories:", err);
        next(err);
    }
}
module.exports = { alluser, allproducts, adproducts, categorydatas }