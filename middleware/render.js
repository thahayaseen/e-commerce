
//register-------------------------------------------------------
const register = (req, res) => {
    const registerMessage = req.session.register || '';
    const ulogined = req.session.ulogin

    delete req.session.register
    ulogined ? res.redirect('/home') : res.render('auth/signup.ejs', { msg: registerMessage })
}


//login---------------------------------------------------------------
const login = async (req, res) => {
    const invalid = req.session.login || ''
    delete req.session.login
    const ulogined = req.session.ulogin
    ulogined ? res.redirect('/home') : res.render('auth/ulogin', { mesasge: invalid })
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

const adminlogin = (req, res) => {
    const notadmin = req.session.admin || ''
    const islogin = req.session.ladmin
    delete req.session.admin
    islogin ? res.redirect('/admin/dashbord') : res.render('auth/admin', { ans: notadmin })
}

// admin html rendering 
// LADMIN MEANS LOGIN ADMIN 
const admin = (req, res) => {
    const islogin = req.session.ladmin
    islogin ? res.render('admin/dashbord') : res.redirect('/admin')
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

    const islogin = req.session.ladmin;

    islogin ? res.render('admin/product', { Products: aproducts, categories: cat, pagination }) : res.redirect('/admin');
};


// catogory 
const catagory = (req, res, next) => {
    const categ = req.session.categories || ''
    const islogin = req.session.ladmin
    const pagination = req.session.pagination || { totalPages: 1, currentPage: 1 };

    delete req.session.categories
    delete req.session.products

    islogin ? res.render('admin/catogory', { categories: categ, pagination }) : res.redirect('/admin')

}

const cartschema = require('../model/cart');
//user section account

const user_scema = require('../model/user_scema')
const address = require('../model/address')
const ordersshema = require('../model/orders')
const wishlistschema = require('../model/wishlist')
const coupon = require('../model/coupon')



//my account 
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

        console.log(addres);




        res.render('userside/user dashbord/address', { address: addres.address })

    } catch (error) {
        console.log(error);

    }
}
const oredrs = async (req, res) => {
    try {

        const userid = req.session.ulogin
        const orders = await ordersshema.find({ user: userid }).populate('products.productid').sort({ createdAt: -1 })

        // console.log('\n datas \n'+orders)
        const aaa = JSON.stringify({ orders })

        console.log(aaa);

        res.render('userside/user dashbord/orders', { orders: orders })
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



    //    console.log(ucart.product[0])
    //    console.log(JSON.stringify(ucart));


    else {
        res.redirect('/signin')
    }
}

const checkout = async (req, res) => {
    const login = req.session.ulogin

    if (req.session.ulogin) {
        const popuser = await user_scema.findById(login).populate('address')
        console.log(popuser);
        const uid = req.session.ulogin
        const cart = await cartschema.findOne({ userid: uid }).populate('product.productid')
        console.log(cart);
        // console.log(JSON.stringify(cart))


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

    const orders = await ordersshema.find({}).populate('user').skip(skip).limit(limit)

    const totalProducts = await ordersshema.countDocuments();
    const countedorders = orders.length;
    console.log(countedorders);

    const totalPages = Math.ceil(totalProducts / limit);
    pagination = { totalPages, currentPage: page, limit: limit };


    res.render('admin/orders', { Orders: orders, pagination })
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

    console.log(coupons);


    res.render('admin/coupen', { coupons })

}
module.exports = { register, login, adminlogin, otp, admin, user, product, catagory, userhome, productlist, myaccount, userdash, useraddress, oredrs, cartrender, checkout, orders, wishlist, coupenrender }