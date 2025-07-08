

const mongoose = require("mongoose")

const checkSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Auth",
        required: true,
    },
    products: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true
            },
            quantity: {
                type: Number,
                require: true,
                default: 1,
            }
        }
    ],
    reference: {
        type: String,
        required: true
    },
    trxref: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        required: true
    }
},{timestamps: true})

module.exports = mongoose.model("Check", checkSchema)