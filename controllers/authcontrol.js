var fs = require('fs');
var path = require('path');
var bcrypt = require('bcrypt');
var cookieParser = require("cookie-parser");
var jwt = require('jsonwebtoken');
var userModel = require("../models/usermodel");

module.exports.registerUser = async (req, res) => {
  let { username, password, retype } = req.body;

  let user = await userModel.findOne({ username });
  if (user) {
    req.flash("exist", '! User already exist');
    res.redirect("/register");
  } else {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(password, salt, async (err, hash) => {
        if (password == retype) {
          await userModel.create({
            username,
            password: hash
          });
          let user = await userModel.findOne({ username });
          let folderpath = path.join(__dirname, '../uploads', username);
          fs.mkdir(folderpath, (err) => {
            if (err) {
              console.error(`Error creating folder`);
            } else {
              console.log(`Folder created successfully.`);
            }
          });
          let token = jwt.sign({ username: username, userid: user._id }, process.env.JWT_KEY);
          res.cookie("token", token);
          res.redirect("/dashboard")
        } else {
          req.flash("again", '! Retype the Password.');
          res.redirect("/register");
        }
      });
    });
  }
}

module.exports.loginUser = async (req, res) => {
  let user = await userModel.findOne({ username: req.body.username });
  if (!user) {
    req.flash("error", '! Invalid username or password.');
    res.redirect("/");
  }
  else {
    bcrypt.compare(req.body.password, user.password, (err, result) => {
      if (result == true) {
        let token = jwt.sign({ username: user.username, userid: user._id }, process.env.JWT_KEY);
        res.cookie("token", token);
        res.redirect("/dashboard");
      } else {
        req.flash("error", '! Invalid username or password.')
        res.redirect("/");
      }
    });
  }

}

module.exports.logoutUser = (req, res) => {
  res.cookie("token", "");
  res.redirect("/");
}

module.exports.deleteUser = async (req, res) => {
  const user = req.user;
  const folderPath = path.join(__dirname, '../uploads', user.username);
  fs.rmdir(folderPath, { recursive: true }, (err) => {
    if (err) {
      console.error('Error deleting folder:', err);
      return;
    }
    console.log('Folder deleted successfully.');
  });
  if(user.dp != "user.png") {
    const dpPath = path.join(__dirname, '../public/images/', user.dp);
    fs.unlink(dpPath, (err) => {
      if (err) {
        console.error('Error deleting the file:', err);
      } else {
        console.log('File deleted successfully!');
      }
    });
  }
  
  await userModel.findOneAndDelete({ username: user.username });
  res.redirect('/');
}