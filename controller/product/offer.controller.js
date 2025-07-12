
const Product = require('../../model/product_schema');

const offerschema = require('../../model/offer')

const offers = async (req, res) => {
    // console.log(req.body);
    const offdata = await offerschema.find({ name: req.body.name })
    console.log(offdata);


    let data = req.body
    if (data.offerid) {
        const offerdatas = await offerschema.findById(data.offerid)
        if (offerdatas) {
            data.selectedItems = JSON.parse(data.selectedItems)
            console.log(data);
            console.log(data.selectedItems);
            console.log('sdfassfa');

            Object.assign(offerdatas, data)
            console.log(req.body.isActive == 'false');

            if (req.body.isActive == 'false') {
                offerdatas.isActive = false
                offerdesaable(data.selectedItems, data.applicationType, offerdatas)
                console.log('disabling');
                await offerdatas.save()

                return res.status(200).json({ success: true, message: 'The Offer Updated successfully' })

            }
            offerdatas.isActive = true
            await offerdatas.save()
            offerapplayinproduct(data.selectedItems, data.applicationType, offerdatas)
            return res.status(200).json({ success: true, message: 'The Offer Updated successfully' })
        }


    }
    if (offdata.length > 0) {
        return res.status(200).json({ success: false, message: 'offer aldredy exsist' })
    }
    // data.name
    // console.log(data.name);


    data.selectedItems = JSON.parse(data.selectedItems)

    // console.log(data);


    const offerdata = await new offerschema(data)
    await offerdata.save()
    offerapplayinproduct(data.selectedItems, data.applicationType, offerdata)

    return res.status(200).json({ success: true, message: 'The Offer Created Successfully' })


}
const offerapplayinproduct = async (selscted, type, offer) => {
    let finddata
    if (type == 'all') {
        console.log('okke');

        const pdatas = await Product.find({})
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

    else if (type == 'product') {
        const pdatas = await Product.find({ _id: { $in: selscted } })
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
module.exports = {   offers, deleteoffers }
