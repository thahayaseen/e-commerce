const mongoose = require('mongoose');

const address = mongoose.Schema({
  userid: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  fullname: {
    type: String,
    trim: true
  },
  addressline1: {
    type: String,
    trim: true
  },
  addressline2: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  state: {
    type: String,
    trim: true
  },
  zipcode: {
    type: String,
    trim: true
  },
  country: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  addrestype: {
    type: String,
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Address', address);
