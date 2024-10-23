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
    const product = req.session.products
    const categ = req.session.categories || ''
    const pagination = req.session.pagination || { totalPages: 1, currentPage: 1 };
    delete req.session.categories
    delete req.session.products
    res.render('userside/productlist', { products: product, categories: categ, pagination })
}

//admin section----------------------------------------------------------------------------------------
//adminlogin

const adminlogin =async (req, res) => {
    const notadmin = req.session.admin || ''
    const islogin = req.session.ladmin
    delete req.session.admin
    if(islogin) {
        res.redirect('/admin/dashbord') 

    }else{ res.render('auth/admin', { ans: notadmin })}
}

// admin html rendering 
// LADMIN MEANS LOGIN ADMIN 
const admin = async(req, res) => {
    const count=req.query.range||7
    const islogin = req.session.ladmin

    if(islogin ) {
    const range= new Date(new Date().setDate(new Date().getDate() - parseInt(count)))
 console.log(range);
 

    // req.session.ladmin
    const productsandcategory=await ordersshema.find({createdAt:{$gt:range}})
    .populate('user')
    .populate('products.productid')
    .sort({createdAt:-1})
    
    console.log(JSON.stringify(productsandcategory));
    
   res.render('admin/dashbord',{products:productsandcategory})} 
   else res.redirect('/admin')
}



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


const product = (req, res, next) => {
    const aproducts = req.session.aproducts || '';
    const cat = req.session.categories || '';
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

        const userid = req.session.ulogin
        const orders = await ordersshema.find({ user: userid }).populate('products.productid').sort({ createdAt: -1 })

        // console.log('\n datas \n'+orders)
        

      

        userid? res.render('userside/user dashbord/orders', { orders: orders }):res.redirect('/signin')
    } catch (error) {
        console.log(error);

    }

}

const cartrender = async (req, res) => {
    if (req.session.ulogin) {
        const ulogin = req.session.ulogin

        let cart = await cartschema.findOne({ userid: ulogin })
        if (!cart) {

            cart = new cartschema({ userid: ulogin, product: [] });
            await cart.save()
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
    const orders = await ordersshema.find({}).populate('user').skip(skip).limit(limit).sort({createdAt:-1})

    const totalProducts = await ordersshema.countDocuments();
    const countedorders = orders.length;
    console.log(countedorders);

    const totalPages = Math.ceil(totalProducts / limit);
    pagination = { totalPages, currentPage: page, limit: limit };


    adlogin?res.render('admin/orders', { Orders: orders, pagination }):res.redirect('/admin')
}
const wishlist = async (req, res) => {
    const uid = req.session.ulogin
    if (uid) {
        const list = await wishlistschema.findOne({ userid: uid }).populate('productid')
        console.log(list);
        if (!list) {
            const cwishlist = new wishlistschema({
                userid: uid,
                productid: []
            })
            await cwishlist.save()
            return res.redirect('/wishlist')
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
            userdata = new wallet({
                userId: uid,
                balance: 0, 
                transactions: [] 
            });
            await userdata.save();
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