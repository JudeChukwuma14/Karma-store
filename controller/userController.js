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
        let totalAmount = 0
        const cart = cartItem.map(item => {
            const total = item.productId.salePrice * item.quantity
            totalAmount += total
            return {
                _id: item._id,
                productId: item.productId._id,
                productName: item?.productId?.productName,
                image: item?.productId?.images[0] || "",
                price: item?.productId?.salePrice,
                quantity: item.quantity,
                stockQuantity: item?.productId?.stockQuantity,
                total: Number(total.toFixed(2))

            }
        })

        return res.render("cart", {
            cart, totalAmount: Number(totalAmount.toFixed(2)), currentUser
        })
    } catch (error) {
        console.log(error.message)
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
const checkoutPage = async (req, res) => {
    try {
        if (!req.user) {
            return res.redirect("/login")
        }
        const userId = req.user.id
        const currentUser = await User.findById(userId)
        if (!currentUser) {
            return res.redirect("/login")
        }

        const userCart = await Cart.find({ userId }).populate("productId")
        let totalAmount = 0
        const cart = await userCart.map(item => {
            const total = item.productId.salePrice * item.quantity
            totalAmount += total
            return {
                _id: item._id,
                productId: item.productId._id,
                productName: item?.productId?.productName,
                image: item?.productId?.images[0] || "",
                price: item?.productId?.salePrice,
                quantity: item.quantity,
                stockQuantity: item?.productId?.stockQuantity,
                total: Number(total.toFixed(2))
            }

        })


        return res.render("checkout", {
            currentUser,
            cart,
            totalAmount: Number(totalAmount.toFixed(2))
        })
    } catch (error) {
        console.log(error.message)
    }
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

const updateCart = async (req, res) => {
    try {
        const { cartId, quantity } = req.body
        if (!req.user) {
            return res.redirect("/login")
        }
        if (!ObjectId.isValid(cartId)) {
            return res.status(401).json({
                success: false,
                message: "Invalid CartId"
            })
        }
        if (!Number.isInteger(quantity) || quantity < 1) {
            return res.status(401).json({
                success: false,
                message: "Invalid quantity"
            })
        }

        const cartItem = await Cart.findOne({ _id: cartId, userId: req.user.id }).populate("productId")
        if (!cartItem || !cartItem.productId) {
            return res.status(401).json({
                success: false,
                message: "Cart not found"
            })
        }

        if (quantity > cartItem.productId.stockQuantity) {
            return res.status(401).json({
                success: false,
                message: `Only ${cartItem.productId.stockQuantity} item in stock`
            })
        }
        cartItem.quantity = quantity
        await cartItem.save()
        return res.status(200).json({
            success: true,
            message: `Cart updated`, quantity: cartItem.quantity
        })
    } catch (error) {
        console.log(error.message)
    }
}

const deleteCart = async (req, res) => {
    try {
        const { cartId } = req.body
        if (!req.user) {
            return res.redirect("/login")
        }
        if (!ObjectId.isValid(cartId)) {
            return res.status(401).json({
                success: false,
                message: "Invalid CartId"
            })
        }
        const cartItem = await Cart.findOneAndDelete({ _id: cartId, userId: req.user.id })
        if (!cartItem) {
            return res.status(401).json({
                success: false,
                message: "Cart not found"
            })
        }
        return res.redirect("/cart")
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    blogDetails, blogPage, cartPage, categoryPage, checkoutPage, confirmationPage, contactPage, elementPage, indexOne, indexTwo, loginPage, registerPage, signleBlog, singleProduct, trackingPage, addCart, updateCart, deleteCart
}

