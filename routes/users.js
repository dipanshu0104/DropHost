const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');

mongoose.connect("mongodb://localhost:27017/DropHost")

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    dp: String,
});

userSchema.plugin(plm);
module.exports = mongoose.model('User', userSchema);



