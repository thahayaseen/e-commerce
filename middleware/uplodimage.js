const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary'); // adjust path accordingly

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'productImages', // You can change the folder name
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }], // optional
  },
});

const upload = multer({ storage });

module.exports = upload;
