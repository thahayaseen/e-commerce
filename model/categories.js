const mongoose = require('mongoose');

// Define the category schema
const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true 
    },
    description: {
        type: String,
        required: true
    },
    list:{
        type:Boolean,
        default:true
    }
}, { timestamps: true });


module.exports = mongoose.model('Category', categorySchema);
