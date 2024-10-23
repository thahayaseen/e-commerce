const mongoose = require('mongoose');


const walletSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: 'Users' 
    },
    balance: {
        type: Number,
        default: 0,
        min: 0 
    },
    transactions: [{
        type: {
            type: String, 
            enum: ['credit', 'debit'], 
            required: true
        },
        amount: {
            type: Number,
            required: true,
            min: 0
        },
        date: {
            type: Date,
            default: Date.now
        },
        description: {
            type: String, 
            default: ''
        }
    }]
},{timestamps:true});


const Wallet = mongoose.model('Wallet', walletSchema);

module.exports = Wallet;
