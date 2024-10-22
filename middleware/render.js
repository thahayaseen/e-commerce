const user_scema = require('../model/user_scema')
const address = require('../model/address')
const ordersshema = require('../model/orders')
const wishlistschema = require('../model/wishlist')
const coupon = require('../model/coupon')
const product_schema = require('../model/product_schema')
const wallet=require('../model/wallet')
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

const offerpage=(req,res)=>{

    product_schema
    const products = [
        {
          _id: "prod001",
          name: "iPhone 13",
          category: "cat001",
          price: 79999,
          stock: 50,
          description: "Latest iPhone model",
          images: ["iphone13.jpg"]
        },
        {
          _id: "prod002",
          name: "Samsung Galaxy S21",
          category: "cat001",
          price: 69999,
          stock: 45,
          description: "Samsung flagship phone",
          images: ["s21.jpg"]
        },
        {
          _id: "prod003",
          name: "Nike Air Max",
          category: "cat002",
          price: 9999,
          stock: 100,
          description: "Comfortable running shoes",
          images: ["airmax.jpg"]
        },
        {
          _id: "prod004",
          name: "Levi's 501 Jeans",
          category: "cat003",
          price: 4999,
          stock: 200,
          description: "Classic fit jeans",
          images: ["levis501.jpg"]
        },
        {
          _id: "prod005",
          name: "MacBook Pro",
          category: "cat004",
          price: 129999,
          stock: 25,
          description: "Powerful laptop for professionals",
          images: ["macbook.jpg"]
        }
      ];
      
      // Sample Categories
      const categories = [
        {
          _id: "cat001",
          name: "Smartphones",
          description: "Mobile phones and accessories",
          isActive: true
        },
        {
          _id: "cat002",
          name: "Footwear",
          description: "Shoes, sandals, and more",
          isActive: true
        },
        {
          _id: "cat003",
          name: "Clothing",
          description: "Men's and women's apparel",
          isActive: true
        },
        {
          _id: "cat004",
          name: "Laptops",
          description: "Notebooks and accessories",
          isActive: true
        },
        {
          _id: "cat005",
          name: "Electronics",
          description: "General electronics",
          isActive: true
        }
      ];
      
      // Sample Offers
      const offers = [
        {
          _id: "off001",
          name: "New Year Special",
          description: "Start the year with amazing discounts",
          discountType: "percentage",
          discountValue: 20,
          applicationType: "category",
          categories: ["cat001", "cat004"],
          validFrom: "2024-01-01",
          validUntil: "2024-01-31",
          minPurchaseAmount: 5000,
          isActive: true,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z"
        },
        {
          _id: "off002",
          name: "Summer Sale",
          description: "Hot deals for summer",
          discountType: "percentage",
          discountValue: 15,
          applicationType: "all",
          validFrom: "2024-03-01",
          validUntil: "2024-03-31",
          minPurchaseAmount: 0,
          isActive: true,
          createdAt: "2024-03-01T00:00:00Z",
          updatedAt: "2024-03-01T00:00:00Z"
        },
        {
          _id: "off003",
          name: "Smartphone Bonanza",
          description: "Exclusive discounts on smartphones",
          discountType: "fixed",
          discountValue: 5000,
          applicationType: "product",
          products: ["prod001", "prod002"],
          validFrom: "2024-02-01",
          validUntil: "2024-02-28",
          minPurchaseAmount: 50000,
          isActive: true,
          createdAt: "2024-02-01T00:00:00Z",
          updatedAt: "2024-02-01T00:00:00Z"
        },
        {
          _id: "off004",
          name: "Fashion Week",
          description: "Trendy deals on clothing and footwear",
          discountType: "percentage",
          discountValue: 30,
          applicationType: "category",
          categories: ["cat002", "cat003"],
          validFrom: "2024-04-01",
          validUntil: "2024-04-15",
          minPurchaseAmount: 2500,
          isActive: false,
          createdAt: "2024-04-01T00:00:00Z",
          updatedAt: "2024-04-01T00:00:00Z"
        },
        {
          _id: "off005",
          name: "Flash Sale",
          description: "24-hour mega discount",
          discountType: "percentage",
          discountValue: 25,
          applicationType: "all",
          validFrom: "2024-05-01",
          validUntil: "2024-05-02",
          minPurchaseAmount: 1000,
          isActive: false,
          createdAt: "2024-05-01T00:00:00Z",
          updatedAt: "2024-05-01T00:00:00Z"
        }
      ];
    res.render('admin/offers',{offers,categories,products})
}



module.exports = { register, login, adminlogin, otp, admin, user, product, catagory, userhome, productlist, myaccount, userdash, useraddress, oredrs, cartrender, checkout, orders, wishlist, coupenrender,resetpass,walletrender,offerpage }