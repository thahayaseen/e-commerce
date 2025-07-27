
const Product = require('../../model/product_schema');

const offerschema = require('../../model/offer')

const offers = async (req, res) => {
    const offdata = await offerschema.find({ name: req.body.name });

    let data = req.body;

    // Convert string to array if sent as JSON string
    if (data.selectedItems && typeof data.selectedItems === 'string') {
        data.selectedItems = JSON.parse(data.selectedItems);
    }

    // Convert string to boolean if needed
    const isActive = req.body.isActive === 'true';
    console.log(data, 'data is ');
    const validform = new Date(data.validFrom)
    // Convert expiryDate to Date object
    const expiryDate = new Date(data.validUntil);
    const currentDate = new Date();
    console.log(expiryDate < currentDate, expiryDate, currentDate);

    // If updating existing offer
    if (data.offerid) {
        const offerdatas = await offerschema.findById(data.offerid);
        if (offerdatas) {
            Object.assign(offerdatas, data);

            // If offer expired, disable and don't apply
            if (expiryDate < currentDate|| currentDate< validform) {
                offerdatas.isActive = false;
                offerdesaable(data.selectedItems, data.applicationType, offerdatas);
                await offerdatas.save();
                return res.status(200).json({ success: false, message: 'Offer has not startd or expired. Disabled it.' });
            }

            if (!isActive) {
                offerdatas.isActive = false;
                offerdesaable(data.selectedItems, data.applicationType, offerdatas);
                await offerdatas.save();
                return res.status(200).json({ success: true, message: 'The Offer Updated and Disabled Successfully' });
            }

            offerdatas.isActive = true;
            await offerdatas.save();
            offerapplayinproduct(data.selectedItems, data.applicationType, offerdatas);
            return res.status(200).json({ success: true, message: 'The Offer Updated successfully' });
        }
    }

    // New offer — check if already exists
    if (offdata.length > 0) {
        return res.status(200).json({ success: false, message: 'Offer already exists' });
    }

    // If offer already expired, don't create
    if (expiryDate < currentDate) {
        return res.status(200).json({ success: false, message: 'Cannot create offer. Expiry date has already passed.' });
    }

    const offerdata = new offerschema(data);
    await offerdata.save();

    const result = await offerapplayinproduct(data.selectedItems, data.applicationType, offerdata);
    if (!result.success) {
        return res.status(200).json(result);
    }

    return res.status(200).json({ success: true, message: 'The Offer Created Successfully' });
};

const offerapplayinproduct = async (selected, type, offer) => {
    let pdatas = [];

    if (type === 'all') {
        pdatas = await Product.find({});
    } else if (type === 'product') {
        pdatas = await Product.find({ _id: { $in: selected } });
    } else if (type === 'category') {
        pdatas = await Product.find({ category_id: { $in: selected } });
    }

    const failedProducts = [];

    // Loop through products and apply discounts only to valid ones
    for (const product of pdatas) {
        let newPrice;

        if (offer.discountType === 'fixed') {
            newPrice = product.price - offer.discountValue;
        } else if (offer.discountType === 'percentage') {
            newPrice = product.price - (product.price * offer.discountValue) / 100;
        }

        if (newPrice >= 100) {
            product.offerdealprice = newPrice;
            product.dealoffertype = offer.discountType;
            await product.save();
        } else {
            failedProducts.push({
                name: product.name,
                originalPrice: product.price,
                attemptedDealPrice: newPrice
            });
        }
    }

    // If any product failed, return error info
    if (failedProducts.length > 0) {
        return {
            success: false,
            message: 'Some products could not be updated due to minimum price restriction (₹100).',
            failedProducts: failedProducts
        };
    }

    return { success: true, message: 'Offer applied successfully to all valid products.' };
}

const offerdesaable = async (selscted, type, offer) => {
    let finddata
    if (type == 'all') {
        console.log('okke');

        const pdatas = await Product.find({})
        if (offer.discountType == 'fixed') {
            pdatas.forEach(async (data) => {
                data.offerdealprice = undefined
                data.dealoffertype = undefined
                data.save()
            })
        }
        else if (offer.discountType == 'percentage') {
            pdatas.forEach(async (data) => {
                data.offerdealprice = undefined
                data.dealoffertype = undefined

                data.save()
            })
        }


    }

    else if (type == 'product') {
        const pdatas = await Product.find({ _id: { $in: selscted } })
        if (offer.discountType == 'fixed') {
            pdatas.forEach(async (data) => {
                data.offerdealprice = undefined
                data.dealoffertype = undefined
                data.save()
            })
        }
        else if (offer.discountType == 'percentage') {
            pdatas.forEach(async (data) => {
                data.offerdealprice = undefined
                data.dealoffertype = undefined

                data.save()
            })
        }
        console.log('products id ' + pdatas.length);

    }
    else if (type == 'category') {
        const pdatas = await Product.find({ category_id: { $in: selscted } })
        console.log('products id ' + pdatas);
        if (offer.discountType == 'fixed') {
            pdatas.forEach(async (data) => {
                data.offerdealprice = data.price - offer.discountValue
                data.dealoffertype = 'fixed'
                data.save()
            })
        }
        else if (offer.discountType == 'percentage') {
            pdatas.forEach(async (data) => {
                data.offerdealprice = data.price - (data.price * offer.discountValue) / 100
                data.dealoffertype = 'percentage'

                data.save()
            })
        }


    }


}
const deleteoffers = async (req, res) => {
    try {
        const offid = req.params.id;
        console.log(`Deleting offer ID: ${offid}`);

        const offerdata = await offerschema.findById(offid)
        let product
        console.log(offerdata);
        console.log(offerdata.selectedItems);

        if (offerdata.applicationType == 'product') {
            product = { _id: { $in: offerdata.selectedItems } }
        }
        else if (offerdata.applicationType == 'category') {
            product = { category_id: { $in: offerdata.selectedItems } }

        }
        else if (offerdata.applicationType == 'all') {

            console.log('yess');

            product = {}

        }
        console.log(product);


        const products = await Product.find(product);
        console.log(products);

        products.forEach(async (product) => {
            product.offerdealprice = undefined;
            product.dealoffertype = undefined;
            product.save();
        });

        await offerschema.deleteOne({ _id: offid });



        res.status(200).json({ success: true, message: 'Offer deleted and products updated' });
    } catch (error) {
        console.error('Error deleting offer:', error);
        res.status(500).json({ success: false, message: 'Failed to delete offer' });
    }
};
module.exports = { offers, deleteoffers }
