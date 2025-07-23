const User = require('../../model/user_scema')
const product_schema = require('../../model/product_schema');
const cartschema = require('../../model/cart');
const address_scema = require('../../model/address');
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
const { sendPasswordResetOTP } = require('../../middleware/getotp');
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
        console.log('exsist');
        console.log(exsist);

        if (exsist.length > 0) {
            req.session.register = "User name or email already exist";
            console.log('yess');

            return res.redirect('/signup')
        }
        else {
            function generateUsername(name) {
                const baseUsername = name.toLowerCase().replace(/\s+/g, '');
                const randomNumber = Math.floor(Math.random() * 1000);
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
                cart = new cartschema({ userid: a._id, product: [] });
                await cart.save()
                const cwishlist = new wishlistschema({
                    userid: a._id,
                    productid: []
                })
                await cwishlist.save()
                userdata = new Wallet({
                    userId: a._id,
                    balance: 0,
                    transactions: []
                });
                await userdata.save();
                getotp(email, otp, userid)
                req.session.username = name 
                req.session.email = email
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
            cartcount:req.cartcount

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

        const quantity = req.body.quantity||1
        const userid = req.session.ulogin
        console.log(productId + ' ' + userid + " " + price);

        try {
            console.log(userid);


            if (userid) {
                let cart = await cartschema.findOne({ userid: userid });

                if (!cart) {
                    res.status(404).json({ success: false, message: 'user not found' })

                }
                const existingProductIndex = cart.product.findIndex(item => item.productid.toString() === productId);

                if (existingProductIndex > -1) {

                    return res.status(200).json({ success: false,message:'Product alredy in cart' })
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
    const product = await product_schema.findById(id)
    console.log(product.stock);
    console.log(number);

    if (usercartdata) {
        if (product.stock >= number) {
            usercartdata.product[index].quantity = number;
            const toatlproductaprice = number * usercartdata.product[index].price

            await usercartdata.save()
            const summerytoatal = usercartdata.totalprice
            res.status(200).json({ success: true, message: 'cart updated successfully', totalprice: toatlproductaprice, sumtoatal: summerytoatal })
        }
        else {
            res.status(200).json({ success: false, message: "This is the maximum quantity" })
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
async function updatestok(productdata, res) {
    console.log('sdfasdgasfgafg');

    for (const datas of productdata) {
        const product = await product_schema.findById(datas.productid);
        if (product.stock < datas.quantity) {
            console.log('yse');

            throw new Error('Insufficient stock for product |' + product.name + "| if money debited it will be refund within 24 hourse" );
        }
        product.stock -= parseInt(datas.quantity);
        await product.save();
    }
}



const deleteaddress = async (req, res) => {
    const id = req.params.id
    const userid = req.session.ulogin
    console.log(id);

    await address_scema.deleteOne({ _id: id })
    const user = await User.findById(userid)
    filteredarray = user.address.filter(addressId => !addressId.equals(id))
    user.address = filteredarray
    // await addresdata.save()
    const data = await user.save()
    data ? res.status(200).json({ success: true }) : res.status(404)


}
const addressave = async (req, res) => {
    console.log(req.body);
    const address = await address_scema.findById(req.body.id)
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
    const shipping=cart.shippingcharge


    return res.status(200).json({ success: true, coupon: coupen.code, discount, toatal: cart.totalprice,shipping })


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

            return res.status(404).json({success:false,message:'Email Not Fount'})
        }


        const resetToken = crypto.randomBytes(32).toString('hex');
        const tokenExpiry = Date.now() + 3600000;


        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = tokenExpiry;
        await user.save();

        // Construct the reset link
        const resetLink = process.env.DOMAIN+`/reset-password/${resetToken}`;

        // Send the reset link to the user's email
        await sendPasswordResetOTP(email, resetLink, user.user_name);

        return res.status(200).json({success:true,message:'Reset password token has been sented'})
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


module.exports = { signup,   viewproduct,  blockuser, cartitemspush, cartupdata, cartitemdelete, addaddress,  deleteaddress,  editname, changepass, productstockdata, patchwishlist, removewish, coupenapplaying, sendreset, resetpage, resetpasspost, addressave,updatestok }     