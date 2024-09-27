var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
var isLoggedIn = require('../middlewares/isLoggedin');
var { analysis } = require('../controllers/analysis');
var multer = require('../utils/multer');
var {
  registerUser,
  loginUser,
  logoutUser,
  deleteUser
} = require('../controllers/authcontrol');
var {
  fileState,
  deleteFile,
  downloadFile,
  renameFile,
  downloadDeleteHandler
} = require('../controllers/filecontrol');

/* GET home page. */
router.get('/', (req, res) => {
  res.render('login', { error: req.flash('error'), islogin: req.flash("login") });
});

router.get('/register', (req, res) => {
  res.render('register', { again: req.flash("again"), exist: req.flash("exist") });
});

router.get("/home", isLoggedIn, (req, res) => {
  res.render("home", { user: req.user });
});

// route for registration.
router.post("/create", registerUser);

router.post("/login", loginUser);

// Route for logout
router.get("/logout", logoutUser);

router.get('/dashboard', isLoggedIn, analysis);

router.get('/myfiles', isLoggedIn, fileState);

router.get('/user', isLoggedIn, async (req, res) => {
  const user = req.user;
  res.render('userpage', { user });
});

router.get('/upload_file', isLoggedIn, async (req, res) => {
  const user = req.user;
  res.render('uploadpage', { user });
});

router.post('/upload', isLoggedIn, multer.upload.array('files'), (req, res) => {

  const files = req.files;
  if (!files || files.length === 0) {
    return res.status(400).send('No files were uploaded.');
  }
  return res.redirect("/myfiles");

});

router.post("/dp-upload", isLoggedIn , multer.dp_upload.single("image"), async (req, res) => {
  const user = req.user;
  user.dp = req.file.filename;
  await user.save();
  res.redirect('/user');
});


// Routes for file management
router.get('/download/:filename', isLoggedIn, downloadFile);


router.get('/delete/:filename', isLoggedIn, deleteFile);


router.post('/rename', isLoggedIn, renameFile);

// route for delete and download all 

router.post('/delete-download', isLoggedIn , downloadDeleteHandler);


// Delete the account
router.get('/delete-ac', isLoggedIn , deleteUser);

module.exports = router;
