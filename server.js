const express = require('express');
const app = express();
require("dotenv").config()
const cookies = require("cookie-parser")
const expressHbs = require('express-handlebars');
const allUserRouter = require("./router/userRoute")
const authRouter = require("./router/authRoute")
const allAdminRouter = require("./router/adminRoute")
const paymentRouter = require("./router/paymentRoute")
const mongoose = require("mongoose")
const MD = process.env.MONGO_URL
mongoose.connect(MD).then(() => {
    console.log("DB is active")
}).catch((err) => {
    console.log(err.message)
})
app.engine("hbs", expressHbs.engine({
    extname: "hbs",
    defaultLayout: "main",
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true
    }
}))
app.set("view engine", "hbs");
app.use(express.static("public"))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookies())
app.use("/", allUserRouter)
app.use("/", authRouter)
app.use("/", allAdminRouter)
app.use("/", paymentRouter)


const port = process.env.PORT || 5500
app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})

