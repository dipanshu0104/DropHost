const mongoose = require("mongoose");

const connectDB = async () => {
    try {
      const conn = await mongoose.connect(process.env.mongoDB_Url);
  
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
      console.error(`Error: ${error.message}`);
    }
  };
  
  module.exports = connectDB;