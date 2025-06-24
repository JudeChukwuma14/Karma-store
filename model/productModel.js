const mongoose = require("mongoose")

const productSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true
    },
    brand: {
        type: String,
    },
    category: {
        type: String,
    },
    description: {
        type: String
    },
    regularPrice: {
        type: Number,
        min: 0,
    },
    salePrice: {
        type: Number,
        min: 0
    },
    sku: {
        type: String,
        unique: true
    },
    stockQuantity: {
        type: Number,
        min: 0,
    },
    size: [String],
    color: [String],
    gender: {
        type: String,
    },
    images: [String]
}, { timestamps: true })


module.exports = mongoose.model("Product", productSchema)