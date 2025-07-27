const mongoose = require('mongoose');

// Define the category schema
const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true ,
        trim:true
    },
    description: {
        type: String,
        required: true,
        trim:true
    },
    list:{
        type:Boolean,
        default:true
    }
}, { timestamps: true });


module.exports = mongoose.model('Category', categorySchema);
