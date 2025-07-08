
const express = require('express')
const verifyToken = require('../middleware/verifyToken')
const { payment, callBack } = require('../controller/payment.controller')
const router = express.Router()

router.post("/payment", verifyToken, payment)
router.get("/callback", verifyToken, callBack)
module.exports = router