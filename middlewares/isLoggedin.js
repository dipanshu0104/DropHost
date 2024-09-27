var bcrypt = require('bcrypt');
// var cookieParser = require("cookie-parser");
var jwt = require('jsonwebtoken');
var userModel = require("../models/usermodel");

module.exports =  async function isLoggedIn(req, res, next){
    if(!req.cookies.token){
      req.flash("login", "! You need to login first.")
      res.redirect("/");
    }
    else{
     let data =  jwt.verify(req.cookies.token, process.env.JWT_KEY);
     let user = await userModel.findOne({username: data.username}).select("-password");
     req.user = user;
     next();
    }
  }
  