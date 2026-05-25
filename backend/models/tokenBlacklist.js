const mongoose = require("mongoose");

const tokenBlackListSchema = mongoose.Schema({
    token: {
        type: String,
        required: [true, "Token is required to be added in blacklist"]
    }
}, { timestamps: true }) // means ke yeh mongodb khudi manage kar lega ke token kab blacklist main aya tha)

module.exports = mongoose.model("blackListedToken", tokenBlackListSchema);