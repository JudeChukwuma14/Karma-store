const express = require("express")
const { getPostProduct, createProduct } = require("../controller/admin.controller")
const verifyToken = require("../middleware/verifyToken")
const upload = require("../lib/multer")
const router = express.Router()

router.get("/post-product", verifyToken,getPostProduct)
router.post("/post-product",verifyToken,upload, createProduct)

module.exports = router