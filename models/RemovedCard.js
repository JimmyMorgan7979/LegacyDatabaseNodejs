const mongoose = require('mongoose')

var removedboardSchema = mongoose.Schema({
    partNumber: String,
    serialNumber: String,
    binNumber: String,
    binLocation: String,
    remanPrice: String,
    exchangePrice: String,
    dateRemoved: String
})

var RemovedCard = mongoose.model("RemovedCard",removedboardSchema)

module.exports = RemovedCard