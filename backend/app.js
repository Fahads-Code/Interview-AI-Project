const express = require("express");
require("dotenv").config();
const app = express();
const db = require("./config/mongooseConnection");
const authRouter = require("./routes/auth");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const interviewRoute = require("./routes/interview.routes");

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// CORS ko update kiya takay local aur Vercel live link dono par chale
app.use(cors({
    origin: function (origin, callback) {
        // Agar local chal raha ho ya Vercel ka koi bhi url ho, to allow karein
        if (!origin || origin.startsWith("http://localhost") || origin.includes(".vercel.app")) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true
}));

app.set("view engine", "ejs");
app.use("/auth", authRouter);
app.use("/interview", interviewRoute);

app.get("/", function(req, res){
    res.send("Interview Backend is Running");
});

// Vercel local environment ke bahar listen() ko handle karne ke liye
if (process.env.NODE_ENV !== 'production') {
    app.listen(3000, function(){
        console.log("Running on port 3000");
    });
}

// YEH LINE VERCEL KE LIYE SAB SE ZAROORI HAI
module.exports = app;