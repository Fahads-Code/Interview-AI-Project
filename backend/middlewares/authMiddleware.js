const jwt = require("jsonwebtoken");

function getUserMiddleware(req, res, next) {
    // ✅ Cookie se token lo, agar nahi mila to Authorization header check karo
    let token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Token not provided",
        });
    }
    try {
        let decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({
            message: "Invalid Token",
        });
    }
}

module.exports = { getUserMiddleware };