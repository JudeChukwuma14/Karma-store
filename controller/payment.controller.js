const Product = require("../model/productModel")
const User = require("../model/authModel")
const Cart = require("../model/cartModel")
const Checkout = require("../model/checkoutModel")
const { initializePayment, verifyPaymentStatus } = require("../middleware/paystack")


const payment = async (req, res) => {
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
        userCart.forEach(item => {
            totalAmount += item.productId.salePrice * item.quantity
        })
        const { first_name, last_name, phoneNumber, email, country, state, city, address, zipcode, message } = req.body

        const transactionData = {
            first_name,
            last_name,
            phoneNumber,
            email: currentUser.email,
            country,
            state,
            city,
            address,
            zipcode,
            message,
            userId: currentUser._id,
            currency: "NGN",
            amount: totalAmount * 100,
            callback_url: "http://localhost:3000/callback"
        }
        const paymentResponse = await initializePayment(transactionData)
        const { authorization_url } = paymentResponse.data
        res.redirect(authorization_url)
    } catch (error) {
        console.error(err.message)
    }
}

const callBack = async (req, res) => {
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
        userCart.forEach(item => {
            totalAmount += item.productId.salePrice * item.quantity
        })
        const { reference, trxref } = req.query
        const paymentStatus = await verifyPaymentStatus(trxref)

        if (paymentStatus.data.status === "success") {
            const products = userCart.map((item) => ({
                productId: item.productId._id,
                quantity: item.quantity
            }))
            await Checkout.create({
                userId,
                products,
                reference: reference || "",
                trxref: trxref || "",
                status: true,
            })
            await Cart.deleteMany({ userId: userId })
            res.render("checkout", {
                message: "Payment successful",
                success: true,
                currentUser
            })
        } else {
            await Checkout.create({
                userId,
                products,
                reference: reference || "",
                trxref: trxref || "",
                status: true,
            })
            res.render("checkout", {
                message: "Payment failed",
                success: false,
                currentUser,
                userCart,
                totalAmount
            })
        }
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = { payment, callBack }