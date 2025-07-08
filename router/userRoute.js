
const express = require('express')
const { blogDetails, blogPage, cartPage, categoryPage, confirmationPage, contactPage, elementPage, indexOne, loginPage, indexTwo, registerPage, signleBlog, singleProduct, trackingPage, checkoutPage, addCart, updateCart, deleteCart } = require('../controller/userController')
const verifyToken = require('../middleware/verifyToken')
const router = express.Router()

router.get("/blog-details", blogDetails)
router.get("/blog", blogPage)
router.get("/cart", verifyToken, cartPage)
router.get("/category", categoryPage)
router.get("/checkout",verifyToken, checkoutPage)
router.get("/confirmation", confirmationPage)
router.get("/contact", contactPage)
router.get('/elements', elementPage)
router.get("/", indexOne)
router.get("/index", indexTwo)
router.get("/login", loginPage)
router.get("/register", registerPage)
router.get("/single-blog", signleBlog)
router.get("/single-product/:id", singleProduct)
router.get("/tracking", trackingPage)
router.post("/addcart/:id", verifyToken, addCart)
router.post("/updatecart", verifyToken, updateCart)
router.post("/delete-cart", verifyToken, deleteCart)




module.exports = router