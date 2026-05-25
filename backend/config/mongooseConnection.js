const mongoose = require("mongoose");
const config = require("config"); // config folder main ja kr wahan ki settinfs ke sath automatically kaam karta hai
const debuger = require("debug")("development:mongoose");
const mazemain = require("debug")("enjoy:mazamaza");

mongoose.connect(`${config.get("MONGO_URI")}`)
.then(function(){
    debuger("Connected with mongodb");
})
.catch(function(err){
    debuger(err.message);
})

module.exports = mongoose.connection;

