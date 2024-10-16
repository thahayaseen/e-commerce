const User = require('../../model/user_scema')
const product_schema = require('../../model/product_schema');
const cartschema = require('../../model/cart');
const address_scema = require('../../model/address');
const orderchema = require('../../model/orders')
const wishlist=require('../../model/wishlist')
const passport = require('passport');
const coupencode=require('../../model/coupon')
const razorpay=require('../../config/razorpay')
const crypto=require('crypto')

require('dotenv').config()
const bcrypt = require('bcrypt')
// register and send otp 
const signup = async (req, res, next) => {
    try {
        const otp = Math.round(100000 + Math.random() * 90000)
        const { name, email, password } = req.body
        const exsist = await User.find({
            $or: [
                { user_name: name },
                { email: email }
            ]
        })
        console.log(exsist);

        if (exsist.length > 0) {
            req.session.register = "User name or email already exist";
            return res.redirect('/signup')
        }
        else {
            function generateUsername(name) {
                const baseUsername = name.toLowerCase().replace(/\s+/g, ''); // Remove spaces and make lowercase
                const randomNumber = Math.floor(Math.random() * 1000); // Add random number to make it more unique
                return `${baseUsername}${randomNumber}`;
            }
            const saltRound = 10;
            const hashed_pass = await bcrypt.hash(password, saltRound)
            const userid = generateUsername(name)
            const users = new User({
                name: name,
                user_name: userid,
                email: email,
                password: hashed_pass,
                uotp: otp
            })
            const a = await users.save()
            if (a) {

                getotp(email, otp, userid)
                req.session.username = name
                req.session.blocked = a.blocked
                next()
                console.log(a);

                console.log("otp sented");


            }
        }
    } catch (error) {
        console.log("error in signin" + error);
        res.status(500).send('An error ocupied')
    }

}

const blockuser = async (req, res, next) => {
    if (req.session.ulogin) {
        const userdata = req.session.ulogin
        const data = await User.findById(userdata)
        if (!data) {
            console.log('not' + userdata);

            return res.redirect('/signin')
        }
        if (!data.blocked) {
            console.log(data);

            return next()
        }
        else {
            return res.redirect('/logout')
        }
    }
    else {
        next()
    }
}

// otp varifing 
const otpvarify = async (req, res, next) => {
    try {
        // fetch data from usets
        const email = req.session.username;
        const otp = req.body.otp;
        // find user data
        const data = await User.findOne({ name: email });
        // cheking user exist or not
        if (!data) {
            req.session.otperror = "otp not match";
            return res.redirect("/otp");
        }

        //timer
        const created_date = data.updatedAt;
        const now_time = new Date();
        const time = now_time.getTime() - created_date.getTime();
        // otp expaire
        if (time > 60000) {
            req.session.otperror = "otp expaired";
            data.uotp = 0;
            await data.save();
            return res.redirect("/otp");
        }
        const rotp = Number(otp);

        if (data.uotp === rotp) {

            console.log("done");
            data.varify = true
            data.uotp = null
            await data.save()
            res.redirect('/signin')
            // delete req.session.username
            // res.send("gdfgsdgsdsjhd")
        } else {
            req.session.otperror = "please enter valid otp";
            return res.redirect("/otp");
        }
    } catch (error) {
        console.error("Error during OTP verification:", error);
        res.status(500).send("Server error during OTP verification");
    }
};
const getotp = require('../../middleware/getotp');
const coupon = require('../../model/coupon');


// resend otp 

const resent = async (req, res, next) => {
    const username = req.session.username
    const users = await User.findOne({ name: username })

    if (!users) {
        res.redirect('/otp')
    }
    const nwotp = Math.round(100000 + Math.random() * 90000)

    users.uotp = nwotp;
    await users.save(),
        console.log('resent otp succsesfully');


    await getotp(users.email, nwotp)

    console.log(users);
    res.redirect('/otp')

}

// login and varifing 

const varifylogin = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        console.log(username, password);

        const check = await User.findOne({ user_name: username, varify: true });

        console.log(check);

        if (!check) {
            req.session.login = "Invalid username or password";
            return res.redirect('/signin');
        }

        const isMatch = await bcrypt.compare(password, check.password);

        if (!isMatch) {
            req.session.login = "Invalid username or password";
            return res.redirect('/signin');
        }

        if (check.blocked) {
            req.session.login = "You have been blocked";
            return res.redirect('/signin');
        }

        req.session.ulogin = check._id;
        return res.redirect('/');

    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred during login');
    }
};

const logout = async (req, res, next) => {
    try {
        req.session.destroy();
        console.log("the user logouted");
        return res.redirect('/signin')
    } catch (error) {
        console.log(error);

    }

}

const viewproduct = async (req, res, next) => {
    try {
        const id = req.params.ids;

        // Fetch the product by its ID
        const productdata = await product_schema.findById(id).populate('category_id');

        if (!productdata) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Get products from the same category, excluding the current product
        const sameProducts = await product_schema.find({
            category_id: productdata.category_id._id,
            _id: { $ne: id }
        });

        res.render('userside/product_over_view', {
            product: productdata,
            sameProducts: sameProducts
        });

        console.log('Product:', productdata);
        console.log('Same category products:', sameProducts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};


const  glogincb = (req, res, next) => {
    passport.authenticate('google', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.redirect('/signin');
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
        
            if (!user.blocked) {
                req.session.ulogin = user._id
                return res.redirect('/')
            }
            if (user.blocked) {
                console.log('notok');

                req.session.login = `your google account ${user.user_name} has been blocked`
                return res.redirect('/signin')
            }
        });
    })(req, res, next);
}
const removewish=async(req,res)=>{
    const wishlistid = req.body.wishlistid
    const index = req.body.index

    console.log(wishlistid+index);
    if (wishlistid) {

        const wishlistData = await wishlist.findById(wishlistid);
        if (wishlistData) {
           
            
                wishlistData.productid.splice(index, 1);
                await wishlistData.save(); 
                res.status(201).json({success:true})
            
        }
    }
}
const cartitemspush = async (req, res) => {
    if (req.session.ulogin) {
        const productId = req.body.priductisdata
        const price = req.body.price

        const quantity = req.body.quantity
        const userid = req.session.ulogin
        console.log(productId + ' ' + userid + " " + price);

        try {

            let cart = await cartschema.findOne({ userid: userid });

            if (!cart) {

                cart = new cartschema({ userid: userid, product: [] });
            }
            const existingProductIndex = cart.product.findIndex(item => item.productid.toString() === productId);

            if (existingProductIndex > -1) {

                cart.product[existingProductIndex].quantity += quantity;
            } else {

                cart.product.push({ productid: productId, quantity: quantity, price: price });

            }


            await cart.save();
            console.log('Product added to cart successfully!');
           
            
            return res.status(200).json({ success: true })


        } catch (error) {
            console.error('Error adding product to cart:', error);
        }


    }
    else {
        req.session.login = 'before product select please login :)'
        res.status(200).json({ success: false, message: 'user need to login' })
    }
    // const cart=cartschema

}



const cartupdata = async (req, res) => {
    const userid = req.session.ulogin
    const { index, number } = req.body
    console.log(index + '   ' + number)
    const id = req.params.cartid
    console.log(id)


    console.log(userid);

    const usercartdata = await cartschema.findOne({ userid: userid })
    const product=await product_schema.findById(id)
    console.log(product.stock);
    console.log(number);
    
    if (usercartdata) {
        if(product.stock>=number){
        usercartdata.product[index].quantity = number;
        const toatlproductaprice = number * usercartdata.product[index].price

        await usercartdata.save()
        const summerytoatal = usercartdata.totalprice
        res.status(200).json({ success: true, message: 'cart updated successfully', totalprice: toatlproductaprice, sumtoatal: summerytoatal })
        }
        else{
            res.status(200).json({success:false,message: "This is the maximum quantity"})
        }
    }
    // console.log(usercartdata.product[index]);

}

const cartitemdelete = async (req, res) => {
    console.log('got')
    const index = req.body.index
    console.log(index);
    const userid = req.session.ulogin
    const usercartdata = await cartschema.findOne({ userid: userid })

    if (!usercartdata) {
        return res.status(200).json({ success: false, message: "please login before delete" })
    }
    usercartdata.product.splice(index, 1)

    await usercartdata.save()
    res.status(200).json({ success: true })
}
const addaddress = async (req, res) => {

    if (req.session.ulogin) {
        try {
            const userid = req.session.ulogin
            const { fullName, addressLine1, addressLine2, city, state, zipCode, country, phoneNumber, addressType } = req.body
            console.log(phoneNumber + typeof phoneNumber)

            const address = await new address_scema({
                userid: userid,
                fullname: fullName,
                addressline1: addressLine1,
                addressline2: addressLine2,
                city: city,
                state: state,
                zipcode: zipCode,
                country: country,
                phone: phoneNumber,
                addrestype: addressType
            })

            const userdata = await User.findById(userid)
            const ad = await address.save()
            userdata.address.push(ad._id)
            const userdatas = await userdata.save()
            console.log(ad);
            console.log(userdatas);
            res.status(200).json({
                success: true
            })
        } catch (error) {
            console.log('the error in posting address' + error);

        }


    }
    else {
        res.redirect('/signin')
    }
}
const placeorder = async (req, res) => {
    // console.log(req.body);
    const userid = req.session.ulogin

    const { selectedAddress, paymentmethods,discount,cname } = req.body
    if (paymentmethods && selectedAddress && userid) {
        try {
            // Find the user's cart and address
            const usercart = await cartschema.findOne({ userid });
            const userdata = await User.findById(userid);
            const selectedaddress = await address_scema.findById(selectedAddress);
    
            // Verify address ownership
            if (selectedaddress.userid.toString() !== userid.toString()) {
                return res.status(400).json({ success: false, message: 'User ID and address do not match' });
            }
    
            // Map product data from cart
            const productdata = usercart.product.map(item => ({
                productid: item.productid._id,
                quantity: item.quantity,
                price: item.price
            }));
    
            // Update stock for each product
            for (const datas of productdata) {
                const product = await product_schema.findById(datas.productid);
                if (product.stock < datas.quantity) {
                    return res.status(400).json({ success: false, message: 'Insufficient stock for product ' + product._id });
                }
                product.stock -= parseInt(datas.quantity);
                await product.save();
            }
    
            // Create order
            const order = new orderchema({
                user: userid,
                products: productdata,
                totalAmount: usercart.totalprice,
                paymentMethod: paymentmethods,
                shippingAddress: selectedaddress,
                'coupon.discount': discount,  // Ensure 'discount' is defined
                'coupon.couponcode': cname    // Ensure 'cname' is defined
            });
    
            const ordersave = await order.save();
            if (paymentmethods === 'onlinePayment') {
               
                if (ordersave) {
                    usercart.product = [];
                    await usercart.save();
                    userdata.orders.push(ordersave._id);
                // console.log(ordersave.totalAmount);

                const options = {
                    amount: ordersave.totalAmount * 100, 
                    currency: 'INR',
                    receipt: ordersave._id.toString() // Use string format
                };
    
                const razorpayOrder = await razorpay.orders.create(options);
                console.log('Razorpay order created:', razorpayOrder);
                
               return  res.status(200).json({
                    success: true,
                    order_id: razorpayOrder.id,
                    razorpay:true,
                    amount: options.amount,
                    orderId: ordersave._id
                })
    
            }
            }
            
                if (ordersave) {
                 
                    usercart.product = [];
                    await usercart.save();
        
                    // Add the order to user's history
                    userdata.orders.push(ordersave._id);
                    await userdata.save();
        
                    return res.status(200).json({ success: true, message: 'The order was successfully placed' });
                }
            
    
        } catch (error) {
            console.log('Error in placing order:', error);
            return res.status(500).json({ success: false, message: 'Error placing order', error });
        }
    }
    

}
const deleteaddress = async (req, res) => {
    const id = req.params.id
    const userid = req.session.ulogin
    await address_scema.deleteOne({ _id: id })
    const user = await User.findById(userid)
    filteredarray = user.address.filter(addressId => !addressId.equals(id))
    user.address = filteredarray
    // await addresdata.save()
    const data = await user.save()
    data ? res.status(200).json({ success: true }) : res.status(404)


}
const cancelorder = async (req, res) => {
    const orderid = req.params.id;
    const order = await orderchema.findById(orderid).populate('products');

    if (order.status === 'Pending') {
        order.status = 'Cancelled';
        await order.save();

        for (const a of order.products) {
            console.log('\n \n' + a + '\n');
            const product = await product_schema.findById(a.productid);
            if (product) {
                product.stock += a.quantity; // Assuming you want to add the quantity back to stock
                await product.save();
            }
        }

        res.status(200).json({ success: true, message: 'The order is canceled successfully' });
    } else {
        res.status(400).json({ success: false, message: 'Order is not pending and cannot be canceled' });
    }
};

const editname = async (req, res) => {
    const changedname = req.body.ename
    const userid = req.session.ulogin
    const udata = await User.findById(userid)
    udata.name = changedname
    const dataup = await udata.save()
    dataup ? res.status(200).json({ success: true, message: 'username successfully changed' }) : res.state(200).json({ success: false, message: 'there is somthig issue in updateing user name' })
}

const changepass = async (req, res) => {
    const { currentPassword, newPassword } = req.body
    const user = await User.findById(req.session.ulogin)
    if (!user) {
        return res.status(404).json({ message: 'usernot found' })
    }



    if (user.password) {
        console.log(user.password);
        
        const isvalid = await bcrypt.compare(currentPassword,user.password)
        if (!isvalid) {
            return res.status(401).json({ message: 'Entered incorrrect password' })
        }
    }
    newhshedpass =await  bcrypt.hash(newPassword, 10)

user.password=newhshedpass
const a =await user.save()
    a?res.status(200).json({success:true}):res,res.status(404)
}
const productstockdata=async (req,res)=>{
    const proid=req.params.id
    const productdata=await product_schema.findById(proid)
    console.log(productdata);
    res.status(200).json({success:true,stock:productdata.stock})
    
}
const cancelitem=async (req,res)=>{
    console.log(req.body);
   const {orderId,productId}= req.body
   const orderdata=await orderchema.findById(orderId)
   const index = orderdata.products.findIndex(product => product.productid == productId);

    console.log(index);
    orderdata.products[index].status=false
    const change=await orderdata.save()
    if (change) {
        res.status(201).json({success:true})
    }
    else{
        res.status(204)
    }
}
const patchwishlist=async (req,res)=>{
    const productid=req.params.id
    const userid=req.session.ulogin
    const wishlistuser=await wishlist.findOne({userid:userid})
    if(!wishlistuser){
        const cwishlist=new wishlist({
            userid:userid,
            productid:[productid]
        })
     return await cwishlist.save()
    }
    else {
        if(!wishlistuser.productid.includes(productid)){
             wishlistuser.productid.push(productid)
        
        await wishlistuser.save()
        }
        
        // if(){

        // }
       
    }
    console.log(productid);
    
}
const coupenapplaying=async(req,res)=>{
    const cname=req.params.name
    const coupen=await coupencode.findOne({code:cname})
    if(!coupen){
       return res.status(200).json({success:false,erromsg:'Entered couponcode is invalid'})
    }
    // const formattedDate = expiryDate.;

        console.log();
        const exdate=coupen.expiryDate.toISOString().split('T')[0]
        const date=new Date().toISOString().split('T')[0]
    console.log(date);
    console.log(exdate);
    if(date>=exdate){
        return res.status(200).json({success:false,erromsg:'The coupon code expaired'})
        
    }
   
    
   
    const userid=req.session.ulogin

    const cart=await cartschema.findOne({userid:userid})
    const price=cart.totalprice>coupen.min&&cart.totalprice<coupen.max
    console.log(price);
     if(!price){
       return res.status(200).json({success:false,erromsg:`The coupon can apply between ${coupen.min} - ${coupen.max} `})
    }
    const discount=(cart.totalprice*coupen.discount)/100
    
  
  res.status(200).json({success:true,coupon:coupen.code,discount,toatal:cart.totalprice})
    
    
}
const razorpayvarify= async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderId
        } = req.body;

        // Verify the payment signature
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        console.log(sign);
        console.log(razorpay_signature);
        
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAYSCECRET)
            .update(sign)
            .digest("hex");

        if (razorpay_signature === expectedSign) {
           
            const updatedOrder = await orderchema.findById(orderId);
            updatedOrder.status='Processing'
            updatedOrder.pstatus=true
           await updatedOrder.save()
            if (!updatedOrder) {
                throw new Error('Order not found');
            }

          

            res.json({
                success: true,
                message: "Payment has been verified",
                order: updatedOrder
            });
        } else {
            throw new Error('Invalid signature');
        }
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(400).json({
            success: false,
            message: "Payment verification failed",
            error: error.message
        });
    }
}
module.exports = { signup, otpvarify, resent, varifylogin, viewproduct, logout, blockuser, glogincb, cartitemspush, cartupdata, cartitemdelete, addaddress, placeorder, deleteaddress, cancelorder, editname, changepass,productstockdata,cancelitem,patchwishlist,removewish,coupenapplaying,razorpayvarify }     