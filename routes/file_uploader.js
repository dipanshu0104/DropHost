const multer = require('multer');
let UserModel = require("./users");


// Set up multer for handling file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const user = await UserModel.findOne({ username: req.session.passport.user });
    cb(null, `uploads/${user.username}/`);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage })


module.exports = upload;