const razor = require("./config/razorpay");

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
            // Razorpay payment integration
            const options = {
                amount: usercart.totalprice * 100, 
                currency: 'INR',
                receipt: ordersave._id.toString() 
            };

            const razorpayOrder = await razor.orders.create(options);
            console.log('Razorpay order created:', razorpayOrder);
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
