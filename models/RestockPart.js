const mongoose = require('mongoose')

var restockPartSchema = mongoose.Schema({
    stockedAS: String,
    description1: String,
    sapNumber: String,
    quantity: String,
    requestor: String,
    daterequested: String
})

var RestockPart = mongoose.model("RestockPart", restockPartSchema)

module.exports = RestockPart