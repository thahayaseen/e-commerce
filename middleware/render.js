const user_scema = require('../model/user_scema')
const address = require('../model/address')
const ordersshema = require('../model/orders')
const wishlistschema = require('../model/wishlist')
const coupon = require('../model/coupon')
const product_schema = require('../model/product_schema')
const wallet=require('../model/wallet')
const categoriesschema=require('../model/categories')
const offer=require('../model/offer')
//register-------------------------------------------------------
const register = (req, res) => {
    const registerMessage = req.session.register || '';
    const ulogined = req.session.ulogin

    delete req.session.register
    ulogined ? res.redirect('/') : res.render('auth/signup.ejs', { msg: registerMessage })
}


//login---------------------------------------------------------------
const login = async (req, res) => {
    const invalid = req.session.login || ''
    delete req.session.login
    const ulogined = req.session.ulogin
    ulogined ? res.redirect('/') : res.render('auth/ulogin', { mesasge: invalid })
}
//otp
const otp = (req, res) => {
    const signin = req.session.username;

    const errorotp = req.session.otperror || '';
    delete req.session.otperror;
    if (signin) {

        res.render('auth/otp', { error: errorotp });
        delete req.session.username; // Remove username after rendering
    } else {
        // User is not signed in, redirect to signup
        return res.redirect('/signup');
    }
};
// home page 
const userhome = async (req, res) => {
    const product = req.session.products
    
    delete req.session.products

    return res.render('userside/dashbord', { products: product })
}

const productlist = async (req, res) => {
    let dealprice=0
    const product = req.session.products
    const categ = req.session.categories || ''
    const pagination = req.session.pagination || { totalPages: 1, currentPage: 1 };
    product.forEach(product=>{

    
        let poffer=product.price-(product.price*product.offer)/100
        console.log(poffer);
        
        if (poffer<product.offerdealprice||product.offerdealprice==0) {
            
            product.dealprice=poffer
        }
        else{
            product.dealprice=product.offerdealprice
            product.offtype=product.dealoffertype
    
            
        }
       })

    
    delete req.session.categories
    delete req.session.products
    res.render('userside/productlist', { products: product, categories: categ, pagination,dealprice })
}

//admin section----------------------------------------------------------------------------------------
//adminlogin

const adminlogin =async (req, res) => {
    const notadmin = req.session.admin || ''
    const islogin = req.session.ladmin
    delete req.session.admin
    if(islogin) {
        res.redirect('/admin/dashboard') 

    }else{ res.render('auth/admin', { ans: notadmin })}
}

// admin html rendering 
// LADMIN MEANS LOGIN ADMIN 
const admin = async (req, res) => {
     const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const count = req.query.range||7
    let matchQuery
    const isLogin = req.session.ladmin;

    if (isLogin) {
        if (startDate && endDate) {
             matchQuery = {
                createdAt: {
                    $gte: new Date(startDate), 
                    $lt: new Date(new Date(endDate).setDate(new Date(endDate).getDate() + 1)) // Increment to next day
                },
                paymentStatus: { $in: ['Pending', 'Paid'] }
            };
        } else {

            matchQuery = {
                createdAt: {
                    $gte: new Date(new Date().setDate(new Date().getDate() - parseInt(count)))
                },
                paymentStatus:{$in:['Pending','Paid']}
            }
            
        }
console.log(matchQuery);

        // Fetch products
        const productsAndCategory = await ordersshema.find(matchQuery )
            .populate('user')
            .populate('products.productid')
            .sort({ createdAt: -1 });

        //  categories
        const categories = await categoriesschema.find();
        const categoryCounts = {};

        // Initialize category counts
        categories.forEach(category => {
            categoryCounts[category._id] = { name: category.name, count: 0 }; 
        });

        // count products in each category
        productsAndCategory.forEach(order => {
            order.products.forEach(product => {
                if (product.productid && categoryCounts[product.productid.category_id]) {
                    categoryCounts[product.productid.category_id].count++;
                }
            });
        });
        let categorydata=Object.values(categoryCounts)
        let filterobjs={}
        categorydata.forEach((data,ind)=>{
            filterobjs[data.name]=data.count
            
        })
        console.log(filterobjs); 
        // console.log(categorydata); 
        // console.log(productsAndCategory); 

   
        res.render('admin/dashbord', {
            products: productsAndCategory,
            categoryCounts: filterobjs
        });
    } else {
        res.redirect('/admin');
    }
};



//user 
const user = (req, res) => { 
    req.session.ladmin
    const islogin = req.session.ladmin
    const { user, totalPages, currentPage, limit } = req.session.users
    console.log(limit);

    delete req.session.users
    islogin ? res.render('admin/users', { Users: user, totalPages, currentPage, limit }) : res.redirect('/admin')
}

//product


const product = async(req, res, next) => {
    const aproducts = req.session.aproducts || '';
    const cat = await categoriesschema.find();
    const pagination = req.session.pagination || { totalPages: 1, currentPage: 1 }; // Default pagination info

    delete req.session.aproducts;
    delete req.session.pagination;

    const islogin = req.session.ladmin

    islogin ? res.render('admin/product', { Products: aproducts, categories: cat, pagination }) : res.redirect('/admin');
};


// catogory 
const catagory = (req, res, next) => {
    const categ = req.session.categories || ''
    const islogin = req.session.ladmin||true
    const pagination = req.session.pagination || { totalPages: 1, currentPage: 1 };

    delete req.session.categories
    delete req.session.products

    islogin ? res.render('admin/catogory', { categories: categ, pagination }) : res.redirect('/admin')

}

const cartschema = require('../model/cart');
//user section account






//my account user side 
const myaccount = async (req, res) => {
    const id = req.session.ulogin
    if (id) {
        const userdata = await user_scema.findById(id)
        console.log(userdata);
        res.render('userside/user dashbord/useraccount', { user: userdata })
    }
    else res.redirect('/signin')
}
const userdash = (req, res) => {
    const ulogined = req.session.ulogin
    const glogin = req.session.glogin
    if (ulogined || glogin) {
        res.render('userside/user dashbord/userdash')
    }
    else {
        res.redirect('/signin')
    }
}

const useraddress = async (req, res) => {
    try {

        const userid = req.session.ulogin
        const addres = await user_scema.findById(userid).populate('address')
         userid? res.render('userside/user dashbord/address', { address: addres.address }):res.redirect('/signin')

    } catch (error) {
        console.log(error);

    }
}
const oredrs = async (req, res) => {
    try {
        const itemsPerPage=6
        const page=req.query.page||1
        const userid = req.session.ulogin
        const orders = await ordersshema.find({ user: userid })
        .populate('products.productid')
        .skip((page - 1) * itemsPerPage)
        .limit(itemsPerPage)
        .sort({ createdAt: -1 })

        // console.log('\n datas \n'+orders)
        
        const totalOrders = await ordersshema.countDocuments({ user: userid });
        const totalPages = Math.ceil(totalOrders / itemsPerPage);
      

        userid? res.render('userside/user dashbord/orders', { orders: orders ,totalPages,currentPage:page}):res.redirect('/signin')
    } catch (error) {
        console.log(error);

    }

}

const cartrender = async (req, res) => {
    if (req.session.ulogin) {
        const ulogin = req.session.ulogin

        let cart = await cartschema.findOne({ userid: ulogin })
        if (!cart) {

           res.status(404).json({success:false,message:'user not fount'})
        }
        const ucart = await cartschema.findOne({ userid: ulogin }).populate('product.productid').exec()
        res.render('userside/cart', { cart: ucart })

    }


    else {
        res.redirect('/signin')
    }
}

const checkout = async (req, res) => {
    const login = req.session.ulogin
    const uid = req.session.ulogin
    
    if (req.session.ulogin) {
        const cart = await cartschema.findOne({ userid: uid }).populate('product.productid')
        if(cart.product.length==0){
            res.redirect('/')
        }
        console.log(cart);
        
        const popuser = await user_scema.findById(login).populate('address')
        console.log(popuser);
        console.log(cart);
       


        res.render('userside/checkout', { savedAddresses: popuser.address, cart: cart })
    }
    else {
        res.redirect('/signin')
    }
}

const orders = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const adlogin=req.session.ladmin
    let orders = await ordersshema.find({}).populate('user').skip(skip).limit(limit).sort({createdAt:-1})
    console.log('order data is'+orders);
    

    const totalProducts = await ordersshema.countDocuments();
    const countedorders = orders.length;
    console.log(countedorders);

    let totalPages = Math.ceil(totalProducts / limit);
    if(totalPages<=0){
        totalPages=1
    }

    pagination = { totalPages, currentPage: page, limit: limit };
   

    adlogin?res.render('admin/orders', { Orders: orders, pagination }):res.redirect('/admin')
}
const wishlist = async (req, res) => {
    const uid = req.session.ulogin
    if (uid) {
        const list = await wishlistschema.findOne({ userid: uid }).populate('productid')
        console.log(list);
        if (!list) {
         res.status(404).json({success:false,message:'user not fount'})
         
       
        }

        res.render('userside/wishlist', { wishlist: list })
    }
    else{
        req.session.login='please login before enter wishlist'
        res.redirect('/signin')
    }
}
const coupenrender = async (req, res) => {
    const coupons = await coupon.find({}) || ''
    const adlogin=req.session.ladmin

    console.log(coupons);

    adlogin? res.render('admin/coupen', { coupons }):res.redirect('/admin')

}
const resetpass=(req,res)=>{
    res.render('auth/resetpass.ejs')
}


const walletrender = async (req, res) => {

    try {
        const uid = req.session.ulogin; 
        const gid = req.session.glogin; 
        if (!uid) {
            return res.redirect('/signin') 
        }

        let userdata = await wallet.findOne({ userId: uid }).populate('userId')
        console.log(uid);
        
        console.log(gid);
        console.log(userdata);
        
        if (!userdata) {
           res.status(404).json({success:false,message:"user not fount"})
        }

      
        res.render('userside/user dashbord/walet', { wallet: userdata });
    } catch (error) {
        console.error('Error rendering wallet:', error);
        res.status(500).send('Internal server error');
    }
};

const offerpage=async (req,res)=>{

    const products=await product_schema.find()
  const categories=await categoriesschema.find()
 const offers=await offer.find().populate('selectedItems.categories')

      
     
    res.render('admin/offers',{offers,categories,products})
}
const datatoedit=async(req,res)=>{
    try {
        const offerid=req.params.id
    const offerdatas=await offer.findById(offerid)
    console.log(offerdatas);
    
    return res.status(200).json(offerdatas)
    } catch (error) {
        console.log('error in fetchinf offer '+error);
        
    }
}


module.exports = { register, login, adminlogin, otp, admin, user, product, catagory, userhome, productlist, myaccount, userdash, useraddress, oredrs, cartrender, checkout, orders, wishlist, coupenrender,resetpass,walletrender,offerpage,datatoedit }