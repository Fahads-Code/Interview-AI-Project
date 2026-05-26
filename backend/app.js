const express = require("express");
require("dotenv").config();
const app = express();
const db = require("./config/mongooseConnection");
const authRouter = require("./routes/auth");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const interviewRoute = require("./routes/interview.routes");

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Optimized CORS Configuration
const allowedOrigins = ["http://localhost:3000", "http://localhost:5173"]; // Apne local frontend ports add karein

app.use(cors({
    origin: function (origin, callback) {
        // 1. Local development, 2. No origin (like Postman), 3. Vercel deployment URLs
        if (!origin || allowedOrigins.includes(origin) || origin.startsWith("http://localhost:") || origin.includes(".vercel.app")) {
            callback(null, true);
        } else {
            console.log("Blocked by CORS:", origin); // Vercel logs mein check karne ke liye
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true
}));

app.set("view engine", "ejs");

// Routes
app.use("/api/auth", authRouter);
app.use("/api/interview", interviewRoute);

app.get("/", function(req, res){
    res.status(200).send("Interview Backend is Running successfully on Vercel!");
});

// Port configuration for Local Development
const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, function(){
        console.log(`Running locally on port ${PORT}`);
    });
}

// VERCEL REQUIREMENT
module.exports = app;