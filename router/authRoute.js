const express = require("express")
const { createAccount, loginUser, logOut } = require("../controller/auth.controller")
const router = express.Router()

router.post("/signup", createAccount)
router.post("/login", loginUser)
router.get("/logout", logOut)
module.exports= router