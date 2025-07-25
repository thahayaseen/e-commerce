const User = require('../../model/user_scema')
const Product = require('../../model/product_schema');
const bcrypt = require('bcrypt')
const path = require('path');
const fs = require('fs');
const categories = require('../../model/categories');
const orders = require('../../model/orders')
const coupons = require('../../model/coupon')
const offerschema = require('../../model/offer')
const excel = require('exceljs')
const Swal = require('sweetalert2')
// admin authentication 
const auth = async (req, res, next) => {
    try {
        const { username, password } = req.body
        console.log(username);


        const exsist = await User.findOne({ user_name: username })
        console.log(exsist, 'data');


        if (!exsist) {
            req.session.admin = 'This user not admin'
            return res.redirect('/admin')
        }
        const adminverigfy = await bcrypt.compare(password, exsist.password)
        console.log(adminverigfy);

        if (!adminverigfy) {
            return res.redirect('/admin')
        }

        if (!exsist.isadmin) {
            return res.redirect('/admin')
        }
        if (exsist.isadmin === true) {
            req.session.ladmin = true
            return res.redirect('/admin/dashboard')

        }





    } catch (error) {
        console.log(error);

    }


}


// admin side user block and unblock 
const accses = async (req, res, next) => {
    try {
        const user_id = req.params.id
        console.log(user_id + 'userid');

        const detials = await User.findById(user_id)
        if (!detials) {
            return res.status(404).json({ message: 'user not found' })
        }
        detials.blocked = !detials.blocked
        await detials.save()

        res.status(200).json({
            success: true,
            udata: detials.blocked,
            message: 'user status updated successfully'
        })

    }
    catch (error) {
        console.log(error);

    }
}



const list = async (req, res, next) => {
    try {
        const id = req.params.id;

        // Find the product by ID
        const product = await Product.findById(id);

        // Check if the product exists
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        product.unlist = !product.unlist;

        // Save the updated product list
        await product.save();

        // Return success response with the updated status
        return res.status(200).json({
            success: true,
            newStatus: product.unlist,
            message: `Product ${product.unlist ? 'listed' : 'unlisted'} successfully.`,
        });
    } catch (error) {
        console.error('Error updating product status:', error);
        return res.status(500).json({ message: 'Internal server error', error });
    }
};
//add product
const padd = async (req, res, next) => {
    const { newProductName, newProductCategory, newProductDescription, newProductPrice, newProductStock, newProductOffer } = req.body
   const exsist= await Product.findOne({name:newProductName})
   console.log(exsist);
   
   if(exsist){
    res.status(409).json({
        success:false,
        message:'Same name Product aldredy exsist'
    })
   }
    else{
        const fiels = req.files
    console.log(fiels);
    let image = []
    fiels.forEach(num => {
        image.push(num.path)
    })
    console.log(image);
    console.log(newProductCategory);

    const newProduct = new Product({
        name: newProductName,
        category_id: newProductCategory,
        description: newProductDescription,
        price: newProductPrice,
        stock: newProductStock,
        offer: newProductOffer,
        images: image

    });
    image = []
    await newProduct.save()

    res.status(200).json({ success: true })
    }

}
const submitedit = async (req, res) => {
    const productId = req.params.id;
    const product = await Product.findById(productId);

    const { productName, productCategory, productDescription, productStock, productPrice, productOffer } = req.body;

    if (productName && productCategory && productDescription && productStock && productPrice) {
        product.name = productName;
        product.category_id = productCategory;
        product.description = productDescription;
        product.stock = productStock;
        product.price = productPrice;
        product.offer = productOffer;
        product.save()
        return res.status(200).json({ success: true })
    }

}

const imageadding = async function updateProduct(req, res) {
    const productId = req.params.id;

    try {
        const files = req.files; // Get uploaded files (new images)
        const croppedImages = req.body.croppedImages ? JSON.parse(req.body.croppedImages) : [];
        const deletedImages = req.body.deletedImages ? JSON.parse(req.body.deletedImages) : [];


        const product = await Product.findById(productId);


        if (files && files.length > 0) {
            files.forEach(file => {
                if (!product.images.includes(file.path)) {
                    product.images.push(file.path);
                }
            });
        }


        if (croppedImages.length > 0) {
            for (const croppedImage of croppedImages) {
                const { base64, name } = croppedImage;

                const buffer = Buffer.from(base64, 'base64');

                const uploadPath = path.join(__dirname, '..', '..', 'public', 'uploads', name);

                await sharp(buffer)
                    .resize(200, 200)
                    .toFile(uploadPath);

                // Add the cropped image to the product's images array
                product.images.push(name);
            }
        }
        // Remove deleted images from the product's image array
        if (deletedImages.length > 0) {
            product.images = product.images.filter(image => !deletedImages.includes(image));

            // Delete the images from the server's file system
            deletedImages.forEach(image => {
                const imagePath = path.join(__dirname, '..', '..', 'public', 'uploads', image);
                fs.unlink(imagePath, (err) => {
                    if (err) {
                        console.error(`Failed to delete image file: ${imagePath}`);
                    }
                });
            });
        }

        // Save the updated product to the database
        await product.save();

        // Send a success response
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ success: false, message: 'Failed to update product.' });
    }
}
// dave categories 
const savecat = async (req, res) => {
    try {
        const { newCategoryName, newProductDescription } = req.body

        const cnames = newCategoryName.toLowerCase()
        const uniqcategory = await categories.findOne({ name: cnames.trim() })
        if (uniqcategory) {
            console.log(uniqcategory);
            return res.status(200).json({ success: false, message: 'This categoty in aldredy exsist' })
        }


        const newcategories = new categories({
            name: newCategoryName.toLowerCase().trim(),
            description: newProductDescription
        })
        await newcategories.save()
        // console.log(req.body);

        res.status(200).json({ success: true })
    } catch (error) {
        console.log('in save categosy rout' + error);

    }
}

const useredit = async (req, res, next) => {

    const { CategoryName, ProductDescription } = req.body

    const cnames = CategoryName.toUpperCase()

    const uniqcategory = await categories.findOne({ name: cnames })

    if (uniqcategory) {

        console.log(uniqcategory);

        return res.status(200).json({ success: false, message: 'This category in aldredy exsist' })
    }
    const catid = req.params.id

    const category = await categories.findById(catid)

    category.name = CategoryName
    category.description = ProductDescription

    await category.save()

    res.status(200).json({ success: true })

}
const categoryunlist = async (req, res, next) => {

    try {

        const catid = req.params.id
        const product = await Product.find({ category_id: catid })
        // console.log(catid);
        for (data of product) {
            data.unlist = !data.unlist
            await data.save()
        }

        const catagory = await categories.findById(catid)
        catagory.list = !catagory.list
        // console.log(catagory);

        await catagory.save()


        res.status(200).json({ success: true })
    } catch (error) {
        console.log('error in unlist route' + error);

    }

}
const updateorder = async (req, res) => {
    const { action, orderId } = req.body
    const orderdata = await orders.findById(orderId)
    if(action=='Cancelled'){
         const wallet=await Wallet.findOne({userId:orderdata.user})
         console.log(orderdata.totalAmount,orderdata.refund,orderdata?.coupon,'dataisss');
         
         const refund=(orderdata.totalAmount-orderdata.refund)-(orderdata?.coupon?orderdata.coupon.discount:0)
         console.log(refund,orderdata);
         
        if(refund!==0){
                wallet.balance +=refund
            wallet.income+=refund
            wallet.transactions.push({
                type: 'credit',
                amount:refund,
                date: new Date(),
                description: `refund of ${orderdata.orderid}`
            });
            await wallet.save()
            orderdata.refund+=refund
        }
    }
    if(action=="Delivered"){
        orderdata.pstatus=true
        orderdata.paymentStatus='Paid'
    }
    orderdata.status = action
    await orderdata.save()
    res.status(200).json({ success: true, message: 'the action changed success' })

}
const getiingorderdetials = async (req, res) => {

    const orderid = req.params.id
    const orderdata = await orders.findById(orderid).populate('user').populate('products.productid')
    console.log(JSON.stringify(orderdata));

    res.status(200).json({ success: true, data: orderdata })

}
const addcoupen = async (req, res) => {
    const bdata = req.body
    console.log(bdata);
    const unique = await coupons.findOne({ code: bdata.code })

    if (unique) {


        return res.status(200).json({ success: false, message: 'This coupon in aldredy exsist' })
    }

    const add = new coupons(bdata)
    await add.save()
    res.status(201).json({ success: true })
}
const coupenedit = async (req, res) => {
    const id = req.params.id
    const cdata = await coupons.findById(id)
    const bdata = req.body
    const unique = await coupons.find({ code: bdata.code, _id: { $ne: id } })
    console.log(unique);

    if (unique.length > 0) {
        return res.status(200).json({ success: false, message: 'This coupon in aldredy exsist' })
    }
    if (cdata) {
        Object.assign(cdata, req.body)
        await cdata.save()
        res.status(201).json({ success: true })
    }
}
const deletecupen = async (req, res) => {
    const cid = req.params.id
    const dcoupen = await coupons.deleteOne({ _id: cid })

    res.status(204).json({ success: true })
}
const PDFDocument = require('pdfkit');
const Wallet = require('../../model/wallet');
const { log } = require('console');







module.exports = { auth, accses, list, padd, imageadding, submitedit, savecat, useredit, categoryunlist, updateorder, getiingorderdetials, addcoupen, coupenedit, deletecupen }