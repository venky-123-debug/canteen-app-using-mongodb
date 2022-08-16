const mongoose = require("mongoose")

const orderSchema = new mongoose.Schema({
  title: { type: String , default: " order name..."},
  available: Number,
  served: Number,
  total: Number ,
  description: { type: String, default: "This order is about..." },
  status: { type: String , default : "available"},
  image: { type: String , default : "dish1"},
})

module.exports.Order = mongoose.model("order", orderSchema)