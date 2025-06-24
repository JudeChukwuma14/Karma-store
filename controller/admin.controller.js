const cloudinary = require("../lib/cloudinary")
const Product = require("../model/productModel")
const User = require("../model/authModel")
const getPostProduct = async (req, res) => {
    try {
        if (req.user) {
            res.render("post-product")
        } else {
            res.redirect("/login")
        }
    } catch (error) {
        console.log("error")
    }

}

const createProduct = async (req, res) => {
    try {
        if (req.user) {
            const userId = req.user.id
            const currentUser = await User.findOne({ _id: userId })
            if (currentUser.role === "admin") {
                const {
                    productName,
                    brand,
                    category,
                    description,
                    regularPrice,
                    salePrice,
                    sku,
                    stockQuantity,
                    size,
                    color,
                    gender,
                } = req.body
                const emptyArr = []
                const incomingArr = [
                    "productName",
                    "brand",
                    "category",
                    "description",
                    "regularPrice",
                    "salePrice",
                    "sku",
                    "stockQuantity",
                    "size",
                    "color",
                    "gender"
                ]
                for (const item of incomingArr) {
                    if (!req.body[item] || req.body === "") {
                        emptyArr.push(item)
                    }
                }
                if (emptyArr.length > 0) {
                    return res.render("post-product", { error: `This input can not be empty ${emptyArr.join(",")}` })
                }
                const imageArr = []
                if (req.files && Array.isArray(req.files)) {
                    const fileArray = req.files.slice(0, 5)
                    for (const item of fileArray) {
                        const uploadedImage = await cloudinary.uploader.upload(item.path)
                        imageArr.push(uploadedImage.secure_url)
                    }
                }

                await Product.create({
                    productName,
                    brand,
                    category,
                    description,
                    regularPrice,
                    salePrice,
                    sku,
                    stockQuantity,
                    size,
                    color,
                    gender,
                    images: imageArr
                })
                return res.render("post-product", { success: "Product Created Successfully" })
            } else {
                return res.render("login", { error: ` ${currentUser?.username} is not a admin` })
            }
        } else {
            res.redirect("/login")
        }
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = { getPostProduct, createProduct }