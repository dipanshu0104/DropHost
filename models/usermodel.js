const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    username: String,
    // email: String,
    password: String,
    dp: {
        type: String,
        default: 'user.png',
    },
});

module.exports = mongoose.model("user", userSchema);
