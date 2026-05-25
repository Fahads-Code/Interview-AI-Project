const userModel = require("../models/user");
const blacklistModel = require("../models/tokenBlacklist");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

async function registerUser(req, res){
    let {username, email, password} = req.body;

    if(!username || !email || !password){
        return res.status(400).json({
           message: "Please provide username, email or password",
        })
    }

    const isUserAlreadyExists = await userModel.findOne({
        $or: [{username}, {email}]
    })

    if(isUserAlreadyExists){
        return res.status(400).json({
            message: "User already exists with this email or username",
        })
    }
    
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = await userModel.create({
        username,
        email,
        password: hash
    })

    const token = jwt.sign({
        id: user._id,
        username: user.username,
        email: user.email
    }, process.env.SECRET_KEY, {expiresIn: "1d"});

    res.cookie("token", token);

    res.status(201).json({
        message: "User registered successfully!",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}

async function loginUser(req, res){
    let {email, password} = req.body;

    const user = await userModel.findOne({ email });
    if(!user){
       return res.status(400).json({
            message: "Something went wrong",
        })
    } 

  
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if(!isPasswordCorrect){
        return res.status(400).json({
            message: "Invalid credentials",
        })
    }

    const token = jwt.sign(
        {id: user._id, email: user.email}, 
        process.env.SECRET_KEY,
        {expiresIn: "1d"} 
    );

    res.cookie("token", token);

  
    return res.status(200).json({
        message: "Login successful!",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}

async function logoutUser(req, res){
   const token = req.cookies.token;
   if(token) {
     await blacklistModel.create({ token })
   }
   res.clearCookie("token");
   res.json({
    message: "User logged out successfully!"
   })
}

async function getUser(req, res){
    let user = await userModel.findOne({ email: req.user.email }); 
    res.status(200).json({
       message: "User details fetched successfully!",
       user:{
         id: user._id,
         email: user.email,
         username: user.username
       }
    })
}

module.exports = {registerUser, loginUser, logoutUser, getUser};