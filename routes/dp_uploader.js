const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require("path");

// Set up multer for handling file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/images/')
    },
    filename: function (req, file, cb) {
        const unique = uuidv4();
      cb(null, unique + path.extname(file.originalname));
    }
  });

const dp_upload = multer({ storage: storage })


module.exports = dp_upload;