const mongoose = require('mongoose')

var requestQuoteSchema = mongoose.Schema({
    partNumber: String,
    serialNumber: String,
    remanPrice: String,
    exchangePrice: String,
    stockedAS: String,
    description1: String,
    sapNumber: String,
    price: String,
    name: String,
    company: String,
    email: String,
    phone: String,
    message: String,
    dateRequest: String,
    quantity: String
})

var RequestQuote = mongoose.model("RequestQuote",requestQuoteSchema)

module.exports = RequestQuote