const axios = require("axios")


const initializePayment = async (transactionData) => {
    const headers = {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
        'Content-Type': 'application/json'
    }

    const response = await axios.post("https://api.paystack.co/transaction/initialize",
        transactionData, { headers }
    )
    return response.data
}


const verifyPaymentStatus = async(trxref)=>{
    const url = `https://api.paystack.co/transaction/verify/${trxref}`
    const response = await axios.get(url,{
        headers:{
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`
        }
    })
    return response.data
}
module.exports = { initializePayment, verifyPaymentStatus }