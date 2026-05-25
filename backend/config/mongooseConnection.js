const mongoose = require("mongoose");
const config = require("config"); 
const debuger = require("debug")("development:mongoose");
const mazemain = require("debug")("enjoy:mazamaza");

// Pehle check karein ke kya Vercel par MONGO_URI set hai, warna config folder se uthayein
const dbURI = process.env.MONGO_URI || config.get("MONGO_URI");

mongoose.connect(dbURI)
.then(function(){
    debuger("Connected with mongodb");
    console.log("Database connected successfully!"); // Live logs mein dekhne ke liye
})
.catch(function(err){
    debuger(err.message);
    console.error("Database connection error:", err.message); // Live logs ke liye
})

module.exports = mongoose.connection;