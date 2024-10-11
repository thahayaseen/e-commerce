const mongoose = require('mongoose');
const { catagory } = require('../middleware/render');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        // required: true
    },
    price: {
        type: Number,
        // required: true
    },
    stock: {
        type: Number, 
        // required: true
    },
    unlist: {
        type: Boolean, 
        default:false
    },
    images: {
        type: [String], 
    },
    description: {
        type: String,
        // required: true
    },
    category_id: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Category', 
        // required: true 
    }
},{timestamps:true});



module.exports = mongoose.model('Product', productSchema);
