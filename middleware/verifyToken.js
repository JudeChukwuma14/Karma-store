const jwt = require("jsonwebtoken")
const verifyToken = (req, res, next)=>{
    const token = req.cookies.Karma
    const decoded = jwt.decode(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
}

module.exports = verifyToken