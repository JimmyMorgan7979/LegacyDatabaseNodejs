const mongoose = require('mongoose')

var removedPartSchema = mongoose.Schema({
    stockedAS: String,
    description1: String,
    sapNumber: String,
    manufacturer: String,
    description2: String,
    location1: String,
    location2: String,
    location3: String,
    drawer: String,
    cross1: String,
    cross2: String,
    cross3: String,
    price: String,
    dateRemoved: String
})

var RemovedPart = mongoose.model("RemovedPart",removedPartSchema)

module.exports = RemovedPart