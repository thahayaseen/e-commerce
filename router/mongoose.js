// MongoDB connection
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/ecommewrs')
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

exports=mongoose
