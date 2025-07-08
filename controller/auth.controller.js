const authUser = require("../model/authModel")
const jwt = require("jsonwebtoken")
const bcryptjs = require("bcryptjs")

const createAccount = async (req, res) => {
    try {
        const { username, email, password, retypepassword } = req.body
        const emptyArray = []
        const incomingFields = ["username", "email", "password", "retypepassword"]
        for (const item of incomingFields) {
            if (!req.body[item] || req.body[item] === "") {
                emptyArray.push(item)
            }
        }
        if (emptyArray.length > 0) {
            return res.render("registration", { error: ` This field is required: ${emptyArray.join(" ,")}` })
        }

        if (password !== retypepassword) {
            return res.render("registration", { error: "Password does not match" })
        }

        const existingEmail = await authUser.findOne({ email })
        if (existingEmail) {
            return res.render("registration", { error: "email already exist" })
        }
        const existingUser = await authUser.findOne({ username })
        if (existingUser) {
            return res.render("registration", { error: "username already exist" })
        }
        const hashPassword = bcryptjs.hashSync(password, 10)
        await authUser.create({
            username, email, password: hashPassword
        })

        res.render("login", { success: "Account created successfully" })
    } catch (err) {
        return res.render("registration", { error: err.message })
    }
}

const loginUser = async (req, res) => {
    try {
        const { emailOrusername, password } = req.body
        const emptyArray = []
        const incomingFields = ["emailOrusername", "password"]
        for (const item of incomingFields) {
            if (!req.body[item] || req.body[item] === "") {
                emptyArray.push(item)
            }
        }
        if (emptyArray.length > 0) {
            return res.render("login", { error: ` This field is required: ${emptyArray.join(" ,")}` })
        }

        const existingUser = await authUser.findOne({ $or: [{ email: emailOrusername }, { username: emailOrusername }] })
        if (!existingUser) {
            return res.render("login", { error: "email/ username and password Mismatch" })
        }
        const checkPassword = bcryptjs.compareSync(password, existingUser.password)
        if (!checkPassword) {
            return res.render("login", { error: "Wrong Credentials" })
        }
        const token = await jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET)
        res.cookie("Karma", token, { maxAge: 36000000 })
        res.redirect("/")
    } catch (err) {
        return res.render("login", { error: err.message })
    }
}

const logOut = (req, res) => {
    try {
        res.cookie("Karma", "", { maxAge: 0 })
        res.redirect("/login")
    } catch (error) {
        console.log(error.message)
    }
}
module.exports = { createAccount, loginUser, logOut }