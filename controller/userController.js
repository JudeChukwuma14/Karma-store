const Product = require("../model/productModel")
const User = require("../model/authModel")
const mongoose = require("mongoose")
const Cart = require("../model/cartModel")
// Get method for all Of my Pages
const blogDetails = (req, res) => {
    res.render("blog-details")
}
const blogPage = (req, res) => {
    res.render("blog")
}
const cartPage = (req, res) => {
    res.render("cart")
}

const addCart = async (req, res) => {
    try {
        if (!req.user) {
            return res.redirect("/login")
        }
        const userId = req.user.id
        const productId = req.params.id
        const { quantity = 1, size, color } = req.body
        console.log(req.body)
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.render("single-product", { error: "Product not found" })
        }
        if (!size || !color) {
            return res.render("single-product", { error: "Please select size and color" })
        }
        const qty = parseInt(quantity)
        console.log(qty)

        if (isNaN(qty) || qty < 1) {
            return res.render('single-product', { error: 'Invalid quantity' });
        }

        const product = await Product.findById(productId)
        console.log(product)

        if (!product) {
            return res.render('single-product', { error: 'Product not found' });
        }
        if (product.stockQuantity < qty) {
            return res.render('single-product', { error: 'Insufficient stock' });
        }
        if (!product.size || !product.color) {
            return res.render("single-product", { error: "Please select size and color" })
        }

        const currentUser = await User.findById(userId)
        console.log(currentUser)
        if (!currentUser) {
            return res.redirect("/login")
        }

        const existingCartItem = await Cart.findOne({ userId, productId, size, color })
        if (existingCartItem) {
            existingCartItem.quantity += qty
            if (existingCartItem.quantity > product.stockQuantity) {
                return res.render('single-product', { error: 'Total quantity exceeds stock' });
            }
            await existingCartItem.save()
        } else {
           const cartMe= await Cart.create({
                userId,
                productId,
                quantity: qty,
                size, color
            })
            console.log(cartMe)
            res.redirect("/cart?success=Added to cart successfully")
        }
    } catch (error) {
        console.error(error.message);
        res.render("single-product", { error: "Something went wrong", errorMessage: error.message })
    }
}
const categoryPage = async (req, res) => {
    try {
        const productPerPage = 6;
        const page = parseInt(req.query.page) || 1;
        const totalProduct = await Product.countDocuments();
        const totalPages = Math.ceil(totalProduct / productPerPage);
        const currentPage = Math.max(1, Math.min(page, totalPages));
        const product = await Product.find().sort({ createdAt: -1 }).skip((currentPage - 1) * productPerPage).limit(productPerPage);

        const allPage = []
        for (let i = 1; i <= totalPages; i++) {
            allPage.push({
                pageNumber: i,
                active: i === currentPage
            })
        }
        const previousPage = currentPage > 1 ? currentPage - 1 : null;
        const nextPage = currentPage < totalPages ? currentPage + 1 : null;

        const newArray = await product.map((item) => {
            return {
                ...item.toObject(),
                oneImage: item.images[0] || "http://localhost:3000/img/product/e-p1.png"
            }
        })

        res.render("category", { newArray, allPage, currentPage, previousPage, nextPage, totalPages, productPerPage });
    } catch (error) {
        console.log(error.message);
        res.render("category", { error: "Something went wrong", errorMessage: error.message })

    }
}
const checkoutPage = (req, res) => {
    res.render("checkout")
}
const confirmationPage = (req, res) => {
    res.render("confirmation")
}

const contactPage = (req, res) => {
    res.render("contact")
}

const elementPage = (req, res) => {
    res.render("elements")
}

const indexOne = async (req, res) => {
    const product = await Product.find().sort({ createdAt: -1 }).limit(8)
    const newArray = await product.map((item) => {
        return {
            ...item.toObject(),
            oneImage: item.images[0] || "http://localhost:3000/img/product/e-p1.png"
        }
    })
    res.render("index", { newArray })
}


const indexTwo = async (req, res) => {
    const product = await Product.find().sort({ createdAt: -1 }).limit(8)
    const newArray = await product.map((item) => {
        return {
            ...item.toObject(),
            oneImage: item.images[0] || "http://localhost:3000/img/product/e-p1.png"
        }
    })
    res.render("index-2", { newArray })
}

const loginPage = (req, res) => {
    res.render("login")
}

const registerPage = (req, res) => {
    res.render("registration")
}

const signleBlog = (req, res) => {
    res.render("single-blog")
}

const singleProduct = async (req, res) => {
    try {
        const productId = req.params.id
        if (!productId) {
            return res.render("single-product", { error: "Product not found" })
        }
        const product = await Product.findOne({ _id: productId })
        if (!product) {
            return res.render("single-product", { error: "Product not found" })
        }
        const discount = product.regularPrice > product.salePrice ? Math.round(((product.regularPrice - product.salePrice) / product.regularPrice) * 100) : 0;
        return res.render("single-product", { product, discount })
    } catch (error) {
        console.log(error.message);
        res.render("single-product", { error: "Something went wrong", errorMessage: error.message })

    }
}
const trackingPage = (req, res) => {
    res.render("tracking")
}




module.exports = {
    blogDetails, blogPage, cartPage, categoryPage, checkoutPage, confirmationPage, contactPage, elementPage, indexOne, indexTwo, loginPage, registerPage, signleBlog, singleProduct, trackingPage, addCart
}

