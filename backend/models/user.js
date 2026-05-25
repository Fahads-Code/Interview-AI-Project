const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
   username: {
    type: String,
    unique: [true, "Username is already registered"],
    required: true
   },
   email: {
    type: String,
    unique: [true, "Email is already registered"],
    required: true
   },
   password: {
     type: String
   }
})

module.exports = mongoose.model("user", userSchema);