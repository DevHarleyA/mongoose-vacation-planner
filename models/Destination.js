const mongoose = require("mongoose")
const Schema = mongoose.Schema

const destinationSchema  = new Schema({
    destinationName: { type: String, required: true, unqiue: true},
    location: { type: String, required: true},
    description: { type: String },
    imgSRC: { type: String, default: 'default_pic.jpeg' },
})

module.exports = mongoose.model("Destination", destinationSchema)