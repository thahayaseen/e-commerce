const PDFDocument = require('pdfkit');
const Wallet = require('../../model/wallet');

const orders = require('../../model/orders')



const returnadmin = async (req, res) => {
    const orderid = req.params.orderid
    const product = req.params.product
    const action = req.params.action
    const order = await orders.findById(orderid).populate('products.productid')
    const userid = order.user
    const productindex = order.products.findIndex(a => a.productid._id == product)
    const wallet = await Wallet.findOne({ userId: userid })
    console.log(productindex);
    const coupon = order.coupon.discount
    let coupondiscount = (order.coupon.discount * 100) / order.totalAmount
    const productprice = (order.products[productindex].price - order.products[productindex].discount) * order.products[productindex].quantity
    let refundamount = (productprice - (productprice * coupondiscount) / 100)
    // console.log(JSON.stringify(order));
    console.log('coupon' + coupondiscount);
    console.log('amount is ' + refundamount);

    console.log(orderid);
    console.log(action);
    // console.log(product);
    if (action === 'accept') {
        order.products[productindex].return = 'Returned'
        order.products[productindex].status = false
        wallet.balance += refundamount
        console.log(wallet.balance);
        wallet.income += refundamount
        order.refund += refundamount
        wallet.transactions.push({
            type: 'credit',
            amount: refundamount,
            date: new Date(),
            description: `refund of ${order.products[productindex].productid.name}`
        });
        wallet.save()

    }
    else if (action === 'reject') {
        order.products[productindex].return = 'CannotReturn'
    }
    const ttl = order.totalAmount - order.refund - (order.coupon?.discount ?? 0)
    console.log('ttls is ',ttl);
    
    if (ttl == 0) {
        order.status = 'Cancelled'
    }
    await order.save()
    return res.status(200).json({ success: true, message: 'action initiated' })
    // order.products.findIndex(a=>)

}
module.exports = { returnadmin, }
