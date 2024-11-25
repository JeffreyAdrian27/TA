const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    let fileName = file.originalname.split(' ').join('_');
    cb(null, Date.now() + '-' + fileName); 
  },
});

const upload = multer({ storage });

module.exports = upload;
