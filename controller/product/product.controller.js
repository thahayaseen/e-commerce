const PDFDocument = require('pdfkit');
const Wallet = require('../../model/wallet');

const orders = require('../../model/orders')



const returnadmin = async (req, res) => {
    try {
        const { orderid, product, action } = req.params;

        const order = await orders.findById(orderid).populate('products.productid');
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        const userId = order.user;
        const wallet = await Wallet.findOne({ userId });
        if (!wallet) return res.status(404).json({ success: false, message: 'Wallet not found' });

        const productIndex = order.products.findIndex(p => String(p.productid._id) === String(product));
        if (productIndex === -1) return res.status(404).json({ success: false, message: 'Product not found in order' });

        const productItem = order.products[productIndex];

        // Calculate coupon discount percentage
        const couponDiscountValue = order.coupon?.discount ?? 0;
        const couponDiscountPercentage = order.totalAmount > 0
            ? (couponDiscountValue * 100) / order.totalAmount
            : 0;

        // Calculate product price and refund amount
        const productTotalPrice = (productItem.price - productItem.discount) * productItem.quantity;
        const refundAmount = productTotalPrice - (productTotalPrice * couponDiscountPercentage) / 100;

        console.log(`Refunding ₹${refundAmount.toFixed(2)} for product: ${productItem.productid.name}`);

        if (action === 'accept') {
            productItem.return = 'Returned';
            productItem.status = false;

            wallet.balance += refundAmount;
            wallet.income += refundAmount;
            order.refund += refundAmount;

            wallet.transactions.push({
                type: 'credit',
                amount: refundAmount,
                date: new Date(),
                description: `Refund for ${productItem.productid.name}`
            });

            await wallet.save();
        } else if (action === 'reject') {
            productItem.return = 'CannotReturn';
        }

        // Check if the order total minus refund and coupon discount is zero or less
        const remainingPayable = order.totalAmount - order.refund - couponDiscountValue;
        console.log('Remaining total after refund:', remainingPayable);

        if (remainingPayable <= 0) {
            order.status = 'Cancelled';
        }

        await order.save();

        return res.status(200).json({ success: true, message: 'Action completed successfully' });
    } catch (err) {
        console.error('Error in returnadmin:', err);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

module.exports = { returnadmin, }
