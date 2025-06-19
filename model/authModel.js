const mongoose = require("mongoose")


const authSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        unique: true
    },
    email:{
        type: String,
        required: true,
        unique: true 
    },
    password:{
         type: String,
        required: true,
    },
    role:{
        type:String,
        enums:["user", "admin"],
        default: "user"
    },
    createAt:{
        type:Date,
        default: Date.now()
    }
})

module.exports = mongoose.model("Auth", authSchema)