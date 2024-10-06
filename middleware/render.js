
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
    delete req.session.categories
    delete req.session.products
    res.render('userside/productlist', { products: product, categories: categ })
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
    const users = req.session.users
    delete req.session.users
    islogin ? res.render('admin/users', { Users: users }) : res.redirect('/admin')
}

//product


const product = (req, res, next) => {
    const products = req.session.products || ''
    const cat = req.session.categories || ''
    const islogin = req.session.ladmin


    delete req.session.products
    islogin ? res.render('admin/product', { Products: products, categories: cat }) : res.redirect('/admin')
}

// catogory 
const catagory = (req, res, next) => {
    const categ = req.session.categories || ''
    const islogin = req.session.ladmin

    delete req.session.categories
    delete req.session.products

    islogin ? res.render('admin/catogory', { categories: categ }) : res.redirect('/admin')

}

//user section account

const user_scema = require('../model/user_scema')



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

const useraddress = (req, res) => {
    res.render('userside/user dashbord/address')

}
const oredrs = (req, res) => {
    res.render('userside/user dashbord/orders')

}

module.exports = { register, login, adminlogin, otp, admin, user, product, catagory, userhome, productlist, myaccount, userdash, useraddress, oredrs }