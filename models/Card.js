const mongoose = require('mongoose')

var boardSchema = mongoose.Schema({
    partNumber: String,
    serialNumber: String,
    binNumber: String,
    binLocation: String,
    remanPrice: String,
    exchangePrice: String,
    dateReceived: String
})

var Card = mongoose.model("Card", boardSchema)

module.exports = Card