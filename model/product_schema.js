const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: String, // Consider changing to Number if it's numerical
        required: true
    },
    stock: {
        type: String, // Consider changing to Number if it's numerical
        required: true
    },
    unlist: {
        type: Boolean, // Consider changing to Number if it's numerical
        default:true
    },
    images: {
        type: [String], // Array of strings to store multiple image URLs or paths
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    category_id: {
        type: mongoose.Schema.Types.ObjectId, // Reference to a category
        
    }
},{timestamps:true});



module.exports = mongoose.model('Product', productSchema);
