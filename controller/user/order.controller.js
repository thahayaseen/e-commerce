

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
const { updatestok } = require('./user');
const returning = async (req, res) => {
    const productid = req.params.proid
    console.log(productid);
    const { returnReason, returnDetails, orderid } = req.body
    // console.log(bodydata);
    const orders = await orderchema.findById(orderid)
    if(orders.status=='Cancelled'){
       return res.status(409).json({
            success:false,
            message:'This Order aldredu canceled'
        })
    }
    console.log(orders);
    const index = orders.products.findIndex(p => p.productid.equals(productid));

    console.log(index);
    orders.products[index].return = "Return requsted"
    orders.products[index].returnReason = returnReason
    orders.products[index].returnExplanation = returnDetails

    await orders.save()
    return res.status(200).json({ success: true, message: 'return requst succsesfully done' })

}
const paymentfaied = async (req, res) => {
    console.log(req.params);
    const orderdata = await orderchema.findById(req.params.id)
    console.log(orderdata);
    orderdata.paymentStatus = 'Failed'
    await orderdata.save()


}
const retrypayment = async (req, res) => {
    const id = req.params.id
    const order = await orderchema.findById(id).populate('products.productid')
    const razorpayid = order.razorpay
    console.log(order);
      for (const item of order.products) {
      const product = item.productid;
      const quantityOrdered = item.quantity;

      if (!product || product.stock < quantityOrdered) {
        return res.status(400).json({
          success: false,
          message: `Product "${product?.name || 'Unknown'}" is out of stock`,
        });
      }
    }

    console.log(razorpayid + order.totalAmount);
    const total = (order.totalAmount - order.coupon.discount * 100)
    return res.status(200).json({
        success: true,
        order_id: razorpayid,
        razorpay: true,
        amount: total,
        orderId: id
    })
    // res.status(200).json({success:true,datas:razorpayid,,})
}
const razorpayvarify = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderId
        } = req.body;

        // Verify the payment signature
        const sign = razorpay_order_id + "|" + razorpay_payment_id;


        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAYSCECRET)
            .update(sign)
            .digest("hex");

        if (razorpay_signature === expectedSign) {

            const updatedOrder = await orderchema.findById(orderId);
            const products = updatedOrder.products.map(item => ({
                productid: item.productid._id,
                quantity: item.quantity,
                price: item.productid.price,
                discount: Math.abs(item.price - item.productid.price)
            }))

           try{
            await updatestok(products, res)
           }catch(err){
          const wallet=await Wallet.findOne({userId:updatedOrder.user})
            wallet.balance +=  updatedOrder.totalAmount+updatedOrder.refund - updatedOrder.coupon.discount
            wallet.income+= updatedOrder.totalAmount+updatedOrder.refund - updatedOrder.coupon.discount
            wallet.transactions.push({
                type: 'credit',
                amount: updatedOrder.totalAmount+updatedOrder.refund - updatedOrder.coupon.discount,
                date: new Date(),
                description: `refund of Order ${updatedOrder.orderid}}`
            });
            updatedOrder.refund=updatedOrder.totalAmount+updatedOrder.refund - updatedOrder.coupon.discount
                 updatedOrder.status = 'Cancelled'
                 updatedOrder.paymentStatus = 'Refunded'
                   await updatedOrder.save()
            await wallet.save()
            throw new Error(err.message)
           }
            updatedOrder.status = 'Processing'
            updatedOrder.paymentStatus = 'Paid'
            await updatedOrder.save()
            if (!updatedOrder) {
                throw new Error('Order not found');
            }

            req.session.orderid = orderId


            res.json({
                success: true,
                message: "Payment has been verified",
                order: updatedOrder
            });
        } else {
            console.log('payment error or failed');
            throw new Error('Invalid signature');

        }
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(400).json({
            success: false,
            message: error.message||"Payment verification failed",
            error: error.message
        });
    }
}
const cancelitem = async (req, res) => {
    try {
        console.log(req.body);
        const { orderid, productid } = req.body;

        let orderdata = await orderchema.findOne({ orderid: orderid }).populate('products.productid')
        if (!orderdata) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }
        console.log(JSON.stringify(orderdata));
        
        const index = orderdata.products.findIndex(product => product._id == productid);
        if (index === -1) {
            return res.status(404).json({ success: false, message: "Product not found in order" });
        }
        if(orderdata.status=='Shipped'){
            return res.status(200).json({success:false,message:'Cannot cancel shipped Product'})
        }
        // Update product status to false
        orderdata.products[index].status = false;

        let percentage = 0;
        let refundprice = 0;

        if (orderdata.coupon && orderdata.coupon.couponcode) {
            console.log('coupon exsist');

            percentage = (orderdata.coupon.discount * 100) / orderdata.totalAmount;
            refundprice = ((orderdata.products[index].price - orderdata.products[index].discount) * orderdata.products[index].quantity)
                - (((orderdata.products[index].price - orderdata.products[index].discount) * percentage / 100)
                    * orderdata.products[index].quantity);
        } else {
            console.log('quantity ' + orderdata.products[index].quantity);
            refundprice = (orderdata.products[index].price - orderdata.products[index].discount) * orderdata.products[index].quantity;
        }
        let count = 0;

        for (const orders of orderdata.products) {
            console.log(orders.status);
            count += !orders.status ? 1 : -1; 
        }
        console.log(Object.values);
        
        console.log(count);
        console.log('length is '+orderdata.products.length);
        console.log(count-orderdata.products.length==0);
        
        // Check if count is exactly zero
        if (count-orderdata.products.length==0) {
            console.log('last one');
            refundprice += orderdata.shippingcharg; 
        }
        
        if(orderdata.paymentStatus=='Paid'){
            
       
            const wallet=await Wallet.findOne({userId:orderdata.user})
            wallet.balance += refundprice
            wallet.income+=refundprice
            wallet.transactions.push({
                type: 'credit',
                amount: refundprice,
                date: new Date(),
                description: `refund of ${orderdata.products[index].productid.name}`
            });
            await wallet.save()
            orderdata.refund = orderdata.refund 
            orderdata.refund += refundprice;
            
        }
        else {
            orderdata.refund += refundprice;

        }
        if (count-orderdata.products.length==0) {
            console.log('yes');
            orderdata.status = 'Cancelled'
            

        }
        else {
            console.log('no');

        }
        // const change = true;
        const change = await orderdata.save();
        console.log('Updated refund in database:', change.refund);

        if (change) {
            res.status(201).json({ success: true });
        } else {
            res.status(204).json({ success: false, message: "Refund not processed" });
        }
    } catch (error) {
        console.error("Error processing cancellation:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
const cancelorder = async (req, res) => {
    const userid = req.session.ulogin
    const orderid = req.params.id;
    const order = await orderchema.findById(orderid).populate('products.productid');

    if (order.status === 'Pending' || order.status === 'Processing') {
        console.log('in cancelation');

        if (order.paymentStatus == 'Paid') {
            const wallets = await Wallet.findOne({ userId: userid })
            console.log('yes');

            // console.log(wallets);
            const money = (order.totalAmount - order.coupon.discount)

            if (!wallets) {
                userdata = new Wallet({
                    userId: userid,
                    balance: money,
                    transactions: []
                });
                await userdata.save();
                order.status = 'Cancelled';
                await order.save();
                return res.status(200).json({ success: true, message: 'The order is canceled successfully' });
            }
            // console.log(wallets);
            wallets.balance += money
            const dats = order.products.map(item => item.productid.name).join(', ')



            wallets.transactions.push({
                type: 'credit',
                amount: money,
                date: new Date(),
                description: `refund of ${dats}`
            });
            console.log('saved');



            await wallets.save()
        }
        order.status = 'Cancelled';
        await order.save();

        for (const a of order.products) {
            console.log('\n \n' + a + '\n');
            const product = await product_schema.findById(a.productid);
            if (product) {
                product.stock += a.quantity;
                await product.save();
            }
        }

        res.status(200).json({ success: true, message: 'The order is canceled successfully' });
    } else {
        res.status(400).json({ success: false, message: 'Order is not pending and cannot be canceled' });
    }
};
const placeorder = async (req, res) => {
    const userid = req.session.ulogin;
    const { selectedAddress, paymentmethods, discount, cname } = req.body;

    if (paymentmethods && selectedAddress && userid) {
        try {
            // user's cart and address
            const usercart = await cartschema.findOne({ userid }).populate('product.productid');
            const userdata = await User.findById(userid);
            const selectedaddress = await address_scema.findById(selectedAddress);

            if (selectedaddress.userid.toString() !== userid.toString()) {
                return res.status(400).json({ success: false, message: 'User ID and address do not match' });
            }
            console.log('cart items');
            console.log(Object.values(usercart));
            console.log(usercart.product.length);
            if(usercart.product.length==0){
                console.log('going home');
                
                return res.status(200).json({success:false,re:true})
            }
            const productdata = usercart.product.map(item => ({
                productid: item.productid._id,
                quantity: item.quantity,
                price: item.productid.price,
                discount: Math.abs(item.price - item.productid.price)
            }));

            // Check product stock
            for (const datas of productdata) {
                const product = await product_schema.findById(datas.productid);

                if (!product) {
                    return res.status(400).json({ success: false, message: `Product with ID ${datas.productid} not found` });
                }

                console.log(`Checking stock for product ID: ${datas.productid} - Stock: ${product.stock}, Requested Quantity: ${datas.quantity}`);
                console.log(product.stock);
                console.log(product.quantity);

                if (product.stock < datas.quantity) {
                    console.log('false');

                    return res.status(400).json({ success: false, message: 'Insufficient stock for product |' + product.name + "|" });
                }
            }

            // Generate unique order ID
            const uniqueString = `${Date.now()}-${Math.random()}`;
            const hash = crypto.createHash('sha256').update(uniqueString).digest('hex');
            const orderId = `ORD-${hash.slice(0, 16).toUpperCase()}`;

            // Create new order


            if (paymentmethods === 'onlinePayment') {
               
          
                const order = new orderchema({
                    user: userid,
                    orderid: orderId,
                    products: productdata,
                    totalAmount: Math.floor((usercart.totalprice) * 100) / 100,
                    paymentMethod: paymentmethods,
                    paymentStatus:'Failed',
                    shippingAddress: selectedaddress,
                    'coupon.discount': discount,
                    'coupon.couponcode': cname,
                    shippingcharg:usercart.shippingcharge
                });
                const ordersave = await order.save();
                // if(Math.floor((ordersave.totalAmount * 100)+(ordersave.shippingcharg * 100) - (ordersave.coupon.discount * 100))>500000){
                //     return res.status(201).json({success:false,message:'cannot pay morethan 5 lack in onlin payment'})
                //    }
                const toatsl=Math.floor((ordersave.totalAmount)+(ordersave.shippingcharg ) - (ordersave.coupon.discount ))
             console.log('code value is'+ordersave.coupon);
             console.log(`${ordersave.totalAmount}\n ${ordersave.shippingcharg} \n ${ordersave.coupon.discount}` );
             
                if (ordersave) {
                    userdata.orders.push(ordersave._id);

                    const options = {
                        amount: Math.floor((ordersave.totalAmount * 100)+(ordersave.shippingcharg * 100) - (ordersave.coupon.discount * 100)),
                        currency: 'INR',
                        receipt: ordersave._id.toString()
                    };

                    const razorpayOrder = await razorpay.orders.create(options);
                    usercart.product = [];
                    await usercart.save();
                    ordersave.razorpay = razorpayOrder.id;
                    await ordersave.save();

                    return res.status(200).json({
                        success: true,
                        order_id: razorpayOrder.id,
                        razorpay: true,
                        amount: options.amount,
                        orderId: ordersave._id
                    });
                }
            } else if (paymentmethods === 'wallet') {
                if (true) {
                    const wallet = await Wallet.findOne({ userId: userid });
                    const total = Math.floor(usercart.totalprice * 100) / 100;

                    if (wallet.balance >= total) {
                        updatestok(productdata, res)
                        const order = new orderchema({
                            user: userid,
                            orderid: orderId,
                            products: productdata,
                            totalAmount: Math.floor(usercart.totalprice * 100) / 100,
                            paymentMethod: paymentmethods,
                            shippingAddress: selectedaddress,
                            'coupon.discount': discount,
                            'coupon.couponcode': cname,
                            shippingcharg:usercart.shippingcharge
                        });

                        const ordersave = await order.save();
                        wallet.outcome+=total+ordersave.shippingcharg
                        wallet.transactions.push({
                            type: 'debit',
                            amount: total+ordersave.shippingcharg,
                            date: new Date(),
                            description: 'Purchased'
                        });
                        order.status = 'Processing';
                        order.paymentStatus = 'Paid';
                        const orderda = await order.save();

                        userdata.orders.push(ordersave._id);
                        wallet.balance -= total;
                        const walletsave=await wallet.save();
                        if (walletsave) {
                            usercart.product = [];
                            await usercart.save();
                            
                        }
                        else{
                            res.status(400).json({success:false,message:'error in wallet'})
                        }

                       
                        req.session.orderid = orderda._id


                        return res.status(200).json({ success: true, message: 'The order was successfully placed using Wallet' });
                    } else {
                        return res.status(200).json({ success: false, reason: 'nobalence', message: 'Insufficient balance' });
                    }
                }
            } else {
                if((usercart.totalprice+usercart.shippingcharge)>100000){
                    return res.status(200).json({success:false,message:'Maximum COD allowed less than 100000 INR'})
                }
                const order = new orderchema({
                    user: userid,
                    orderid: orderId,
                    products: productdata,
                    totalAmount: Math.floor(usercart.totalprice * 100) / 100,
                    paymentMethod: paymentmethods,
                    shippingAddress: selectedaddress,
                    'coupon.discount': discount,
                    'coupon.couponcode': cname,
                    shippingcharg:usercart.shippingcharge
                });

                const ordersave = await order.save();
                updatestok(productdata, res)
                usercart.product = [];
                await usercart.save();

                userdata.orders.push(ordersave._id);
                await userdata.save();
                req.session.orderid = ordersave._id
                return res.status(200).json({ success: true, cod: true, message: 'The order was successfully placed' });
            }
        } catch (error) {
            console.error('Error in placing order:', error);
            return res.status(500).json({ success: false, message: 'Error placing order', error: error.message });
        }
    }
    else{
        res.redirect('/')
    }
}
module.exports = {placeorder, cancelorder,cancelitem, razorpayvarify, returning,  paymentfaied, retrypayment }     
