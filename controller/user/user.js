const User = require('../../model/user_scema')
const product_schema = require('../../model/product_schema');
const cartschema = require('../../model/cart');
const Address_scema = require('../../model/address');
const orderchema = require('../../model/orders')
const wishlist = require('../../model/wishlist')
const passport = require('passport');
const coupencode = require('../../model/coupon')
const Wallet = require('../../model/wallet')
const razorpay = require('../../config/razorpay')
const wishlistschema = require('../../model/wishlist')
const crypto = require('crypto')
const PDFDocument = require('pdfkit');
require('dotenv').config()
const bcrypt = require('bcrypt')
const fs = require('fs');
const { sendPasswordResetOTP, getotp } = require('../../middleware/getotp');
// register and send otp 
const signup = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP

        const existingUser = await User.findOne({
            $or: [{ user_name: name }, { email }]
        });

        if (existingUser) {
            // If user already exists but is not verified
            if (!existingUser.verified) {
                const now = new Date();
                const otpSentTime = new Date(existingUser.updatedAt); // or createdAt if better
                const diffInMinutes = (now - otpSentTime) / (1000 * 60);

                if (diffInMinutes < 15) {
                    req.session.register = "OTP already sent. Please wait before requesting a new one.";
                    return res.redirect('/signup');
                } else {
                    // Resend OTP
                    existingUser.uotp = otp;
                    existingUser.updatedAt = new Date();
                    await existingUser.save();

                    getotp(existingUser.email, otp, existingUser.user_name);
                    req.session.username = existingUser.name;
                    req.session.email = existingUser.email;
                    req.session.blocked = existingUser.blocked;

                    console.log("OTP re-sent after 15 minutes.");
                    return next();
                }
            }

            req.session.register = "Username or email already exists.";
            return res.redirect('/signup');
        }

        // If user doesn't exist, create new
        function generateUsername(name) {
            const base = name.toLowerCase().replace(/\s+/g, '');
            const randomNum = Math.floor(Math.random() * 1000);
            return `${base}${randomNum}`;
        }

        const saltRounds = 10;
        const hashedPass = await bcrypt.hash(password, saltRounds);
        const generatedUsername = generateUsername(name);

        const newUser = new User({
            name,
            user_name: generatedUsername,
            email,
            password: hashedPass,
            uotp: otp,
            verified: false // make sure this field exists in your schema
        });

        const savedUser = await newUser.save();

        // Create Cart, Wishlist, Wallet
        await new cartschema({ userid: savedUser._id, product: [] }).save();
        await new wishlistschema({ userid: savedUser._id, productid: [] }).save();
        await new Wallet({ userId: savedUser._id, balance: 0, transactions: [] }).save();

        // Send OTP
        getotp(email, otp, generatedUsername);

        // Store session
        req.session.username = name;
        req.session.email = email;
        req.session.blocked = savedUser.blocked;

        console.log("New user created and OTP sent.");
        return next();

    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).send("An error occurred during signup.");
    }
};


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



const viewproduct = async (req, res, next) => {
    try {
        const id = req.params.ids;

        // Fetch the product by its ID
        const productdata = await product_schema.findOne({ _id: id, unlist: false }).populate('category_id');

        if (!productdata) {
            res.redirect('/404')
            return
        }

        // Get products from the same category, excluding the current product
        const sameProducts = await product_schema.find({
            category_id: productdata.category_id._id,
            _id: { $ne: id }
        });

        let poffer = productdata.price - (productdata.price * productdata.offer) / 100
        console.log(poffer);

        if (poffer < productdata.offerdealprice || productdata.offerdealprice == 0) {

            productdata.dealprice = poffer
        }
        else {
            productdata.dealprice = productdata.offerdealprice
            productdata.offtype = productdata.dealoffertype

        }

        res.render('userside/product_over_view', {
            product: productdata,
            sameProducts: sameProducts,
            cartcount: req.cartcount

        });

        console.log('Product:', productdata);
        console.log('Same category products:', sameProducts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};



const removewish = async (req, res) => {
    const wishlistid = req.body.wishlistid
    const index = req.body.index

    console.log(wishlistid + index);
    if (wishlistid) {

        const wishlistData = await wishlist.findById(wishlistid);
        if (wishlistData) {


            wishlistData.productid.splice(index, 1);
            await wishlistData.save();
            res.status(201).json({ success: true })

        }
    }
}
const cartitemspush = async (req, res) => {
    console.log(req.session.ulogin);

    if (req.session.ulogin) {
        const productId = req.body.priductisdata
        const price = req.body.price

        const quantity = req.body.quantity || 1
        const userid = req.session.ulogin
        console.log(productId + ' ' + userid + " " + price);

        try {
            console.log(userid);

const product=await product_schema.findById(productId)
if(product.stock<=0){
    return res.status(200).json({ success: false, message: 'Product outofstock' })
}
            if (userid) {
                let cart = await cartschema.findOne({ userid: userid });

                if (!cart) {
                    res.status(404).json({ success: false, message: 'user not found' })

                }
                const existingProductIndex = cart.product.findIndex(item => item.productid.toString() === productId);

                if (existingProductIndex > -1) {

                    return res.status(200).json({ success: false, message: 'Product alredy in cart' })
                } else {

                    cart.product.push({ productid: productId, quantity: quantity, price: price });

                }


                await cart.save();
                console.log('Product added to cart successfully!');


                return res.status(200).json({ success: true })


            }
            else {
                res.redirect('/signin')
            }
        } catch (error) {
            console.error('Error adding product to cart:', error);
        }


    }
    else {
        req.session.login = 'before product select please login :)'
        res.status(200).json({ success: 'notlogind', message: 'Please login before continued' })
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
    const product = await product_schema.findOne({ _id: id })
    console.log(product.stock);
    console.log(number);

    if (usercartdata) {
        if (product.unlist) {
            res.status(200).json({
                success: false,
                unlist: true,
                message: 'Product not available right now'
            })
            return
        }
        if (product.stock >= number) {
            usercartdata.product[index].quantity = number;
            const toatlproductaprice = number * usercartdata.product[index].price

            await usercartdata.save()
            const summerytoatal = usercartdata.totalprice
            res.status(200).json({ success: true, message: 'cart updated successfully', totalprice: toatlproductaprice, sumtoatal: summerytoatal })
        }
        else {
            res.status(409).json({ success: false, message: "This is the maximum quantity" })
        }
    }
    // console.log(usercartdata.product[index]);

}

const cartitemdelete = async (req, res) => {
    console.log('got', req.body)
    const productId = req.body.productId
    // console.log(index);
    const userid = req.session.ulogin

    const updatedCart = await cartschema.findOneAndUpdate(
        { userid: userid },
        {
            $pull: {
                product: {
                    productid: productId // match nested productid field
                }
            }
        },
        { new: true }
    );
    console.log(updatedCart, 'caretdaga');

    if (!updatedCart) {
        return res.status(200).json({ success: false, message: "please login before delete" })
    }


    await updatedCart.save()
    res.status(200).json({ success: true })
}
const addaddress = async (req, res) => {

    if (req.session.ulogin) {
        try {
            const userid = req.session.ulogin
            const { fullName, addressLine1, addressLine2, city, state, zipCode, country, phoneNumber, addressType } = req.body
            console.log(phoneNumber + typeof phoneNumber)
            // ({ _id:userid,fullName: fullName })
            console.log(fullName,'full name is ');
            
            const findAddress =await Address_scema.findOne({userid:userid,fullname:fullName})
            console.log(findAddress,userid);
            
            if (findAddress) {
                res.status(200).json({
                    success: false,
                    message: 'Alldredy exsists'
                })
                return
            }
            
            const address = await new Address_scema({
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
                success: true,
                address
            })
        } catch (error) {
            console.log('the error in posting address' + error);

        }


    }
    else {
        res.redirect('/signin')
    }
}
async function updatestok(productdata, res) {
    console.log('sdfasdgasfgafg');

    for (const datas of productdata) {
        const product = await product_schema.findById(datas.productid);
        if (product.stock < datas.quantity) {
            console.log('yse');

            throw new Error('Insufficient stock for product |' + product.name + "| if money debited it will be refund to your wallet within 24 hourse");
        }
        product.stock -= parseInt(datas.quantity);
        await product.save();
    }
}



const deleteaddress = async (req, res) => {
    const id = req.params.id
    const userid = req.session.ulogin
    console.log(id);

    await Address_scema.deleteOne({ _id: id })
    const user = await User.findById(userid)
    filteredarray = user.address.filter(addressId => !addressId.equals(id))
    user.address = filteredarray
    // await addresdata.save()
    const data = await user.save()
    data ? res.status(200).json({ success: true }) : res.status(404)


}
const addressave = async (req, res) => {
    console.log(req.body);
    const address = await Address_scema.findById(req.body.id)
    Object.assign(address, req.body)
    console.log(address);

    const addresaveed = await address.save()
    console.log('saved' + addresaveed);

    if (addresaveed) {
        return res.status(200).json({ success: true, message: 'address updated' })
    }
}


const editname = async (req, res) => {
    const changedname = req.body.ename
    if (changedname.trim() == '') {
        res.state(200).json({ success: false, message: 'Field cannot be emptry' })
        return
    }
    else {
        const userid = req.session.ulogin
        const udata = await User.findById(userid)
        console.log(udata, 'data');

        udata.name = changedname
        const dataup = await udata.save()
        dataup ? res.status(200).json({ success: true, message: 'username successfully changed' }) : res.state(200).json({ success: false, message: 'there is somthig issue in updateing user name' })
    }
}

const changepass = async (req, res) => {
    const { currentPassword, newPassword } = req.body
    const user = await User.findById(req.session.ulogin)
    if (!user) {
        return res.status(404).json({ message: 'usernot found' })
    }



    if (user.password) {
        console.log(user.password);

        const isvalid = await bcrypt.compare(currentPassword, user.password)
        if (!isvalid) {
            return res.status(401).json({ message: 'Entered incorrrect password' })
        }
    }
    newhshedpass = await bcrypt.hash(newPassword, 10)

    user.password = newhshedpass
    const a = await user.save()
    a ? res.status(200).json({ success: true }) : res, res.status(404)
}
const productstockdata = async (req, res) => {
    const proid = req.params.id
    const productdata = await product_schema.findById(proid)
    console.log(productdata);
    res.status(200).json({ success: true, stock: productdata.stock })

}


const patchwishlist = async (req, res) => {
    const productid = req.params.id;
    const userid = req.session.ulogin;

    const wishlistuser = await wishlist.findOne({ userid: userid });

    if (userid) {
        if (!wishlistuser) {
            const cwishlist = new wishlist({
                userid: userid,
                productid: [productid],
            });
            await cwishlist.save();
            return res.status(200).json({ success: true, message: 'Product added to your wishlist.' });
        } else {
            if (wishlistuser.productid.includes(productid)) {
                return res.status(200).json({ success: false, message: 'The product is already in your wishlist.' });
            } else {
                wishlistuser.productid.push(productid);
                await wishlistuser.save();
                return res.status(200).json({ success: true, message: 'Product added to your wishlist.' });
            }
        }
    }
    else {
        return res.status(200).json({ success: 'nologined', message: 'Make sure you logind.' });

    }


};

const coupenapplaying = async (req, res) => {
    const cname = req.params.name
    console.log(cname);

    const coupen = await coupencode.findOne({ code: cname })
    if (!coupen) {
        return res.status(200).json({ success: false, erromsg: 'Entered couponcode is invalid' })
    }
    // const formattedDate = expiryDate.;

    console.log();
    const exdate = coupen.expiryDate.toISOString().split('T')[0]
    const date = new Date().toISOString().split('T')[0]
    console.log(date);
    console.log(exdate);
    if (date >= exdate) {
        return res.status(200).json({ success: false, erromsg: 'The coupon code expaired' })

    }



    const userid = req.session.ulogin

    const cart = await cartschema.findOne({ userid: userid })
    const price = cart.totalprice > coupen.min && cart.totalprice < coupen.max
    console.log(price);
    if (!price) {
        return res.status(200).json({ success: false, erromsg: `The coupon can apply between ${coupen.min} - ${coupen.max} ` })
    }
    const discount = (cart.totalprice * coupen.discount) / 100
    const shipping = cart.shippingcharge


    return res.status(200).json({ success: true, coupon: coupen.code, discount, toatal: cart.totalprice, shipping })


}

const sendreset = async (req, res) => {
    try {
        const { email } = req.body;
        req.session.username = email;
        console.log('insideofir');
        console.log(email);


        const user = await User.findOne({ email });
        if (!user) {
            console.log('nouser');

            return res.status(404).json({ success: false, message: 'Email Not Fount' })
        }


        const resetToken = crypto.randomBytes(32).toString('hex');
        const tokenExpiry = Date.now() + 3600000;


        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = tokenExpiry;
        await user.save();

        // Construct the reset link
        const resetLink = process.env.DOMAIN + `/reset-password/${resetToken}`;

        // Send the reset link to the user's email
        await sendPasswordResetOTP(email, resetLink, user.user_name);

        return res.status(200).json({ success: true, message: 'Reset password token has been sented' })
    } catch (error) {
        console.error(error);
        res.status(500).send('Error sending reset email.');
    }
};
const resetpage = async (req, res) => {
    const { token } = req.params;

    // Find user by token and check if the token is still valid
    const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() } // Ensure the token is still valid
    });

    if (!user) {
        return res.status(400).send('Password reset token is invalid or has expired.');
    }

    // Render a form where the user can enter a new password
    res.render('reset-password', { token });
}
const resetpasspost = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        // Find the user by token and check if token is valid
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() } // Ensure token is still valid
        });

        if (!user) {
            return res.status(400).send('Password reset token is invalid or has expired.');
        }

        const hashed_pass = await bcrypt.hash(password, 10)

        user.password = hashed_pass;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.redirect('/signin')
    } catch (error) {
        console.error(error);
        res.status(500).send('Error resetting password.');
    }
}


module.exports = { signup, viewproduct, blockuser, cartitemspush, cartupdata, cartitemdelete, addaddress, deleteaddress, editname, changepass, productstockdata, patchwishlist, removewish, coupenapplaying, sendreset, resetpage, resetpasspost, addressave, updatestok }     