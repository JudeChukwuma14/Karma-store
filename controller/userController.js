const Product = require("../model/productModel")
const User = require("../model/authModel")
const mongoose = require("mongoose")
const Cart = require("../model/cartModel")
const ObjectId = mongoose.Types.ObjectId
// Get method for all Of my Pages
const blogDetails = (req, res) => {
    res.render("blog-details")
}
const blogPage = (req, res) => {
    res.render("blog")
}
const cartPage = async (req, res) => {
    try {
        if (!req.user) {
            return res.redirect("/login")
        }
        const userId = req.user.id
        const currentUser = await User.findOne({ _id: userId })

        if (!currentUser) { return res.redirect("/login") }

        const cartItem = await Cart.find({ userId }).populate("productId")

        const totalPrice = parseFloat(
            cartItem.reduce((total, item) => {
                return total + (item.quantity * (item.productId?.salePrice || 0))
            }, 0).toFixed(2)
        )
        const firstImage = cartItem.map(item => ({
            ...item.toObject(),
            newImage: item.productId?.images?.[0] || "/image/cart.jpg"
        }))
        console.log(firstImage)

        return res.render("cart", {
            firstImage,
            totalPrice,
            currentUser
        })
    } catch (error) {

    }
    res.render("cart")
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




const addCart = async (req, res) => {
    try {
        if (!req.user) return res.redirect("/login")
        const { id: productId } = req.params
        const userId = req.user.id
        const quantity = parseInt(req.body?.quantity) || 1
        if (!ObjectId.isValid(productId)) {
            return renderError("Invalid Product ID")
        }
        if (quantity < 1) {
            return renderError("Invalid quantity")
        }
        const [currentUser, product] = await Promise.all([
            User.findById(userId),
            Product.findById(productId)
        ])
        if (!currentUser) return renderError("User not found")
        if (!product) return renderError("Product not found")

        if (product.stockQuantity < quantity) {
            return renderError(`Only ${product.stockQuantity} item in stock`)
        }

        let cartItem = await Cart.findOne({ userId, productId })
        if (cartItem) {
            const newQuantity = cartItem.quantity + quantity
            if (newQuantity > product.stockQuantity) {
                return renderError(`Total quantity ${newQuantity} exceeds availabile stock`)
            }
            cartItem.quantity = newQuantity
            await cartItem.save()
        } else {
            cartItem = await Cart.create({
                userId, productId, quantity, size: req.body?.size, color: req.body?.color
            })
        }
        res.render('single-product', {
            product,
            currentUser,
            success: 'Added to cart successfully'
        });

    } catch (error) {
        console.log(error.message)
    }
    // Error Helper Function
    async function renderError(message, errorMessage = null) {
        return res.render("single-product", {
            product: Product || null,
            currentUser: User || (req.user ? await User.findById(req.user.id) : null),
            error: message,
            errorMessage
        })
    }
}


module.exports = {
    blogDetails, blogPage, cartPage, categoryPage, checkoutPage, confirmationPage, contactPage, elementPage, indexOne, indexTwo, loginPage, registerPage, signleBlog, singleProduct, trackingPage, addCart
}

