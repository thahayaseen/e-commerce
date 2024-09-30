
const multer = require('multer');
const path = require('path');



// Set storage for the uploaded files
const storage = multer.diskStorage({
  destination: './public/uploads',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // append date to avoid name conflicts
  }
});

// Initialize upload
const upload = multer({ storage: storage });
// upload.array('productImages')
module.exports=upload

