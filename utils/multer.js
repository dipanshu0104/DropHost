var multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require("path");

// Set up multer for handling file uploads
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const user = req.user;
        cb(null, `uploads/${user.username}/`);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage: storage })


const storage2 = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/images/')
    },
    filename: function (req, file, cb) {
        const unique = uuidv4();
      cb(null, unique + path.extname(file.originalname));
    }
  });

const dp_upload = multer({ storage: storage2 })


module.exports = { upload, dp_upload };