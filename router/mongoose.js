// MongoDB connection
const mongoose = require('mongoose');
// require('dotenv').config()

mongoose.connect(process.env.mongoosekey)
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });



module.exports=mongoose
