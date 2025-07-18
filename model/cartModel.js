const mongoose = require("mongoose")

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, ref: "Auth",
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true
    },
    quantity: {
        type: Number, require: true, default: 1
    },
    size: { type: String, required: true, default: 1 },
    color: { type: String, required: true, default: 1 },
}, { timestamps: true })

module.exports = mongoose.model("Cart", cartSchema)