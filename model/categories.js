const mongoose = require('mongoose');

// Define the category schema
const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true // Ensures category names are unique
    },
    description: {
        type: String,
        required: true
    },
    list:{
        type:Boolean
    }
}, { timestamps: true });

// Export the category model
module.exports = mongoose.model('Category', categorySchema);
