const mongoose = require("mongoose")

const orderSchema = new mongoose.Schema({
  title: { type: String , default: " order name..."},
  available: { type: Number, default: 0 },
  served: { type: Number, default: 0 },
  total: { type: Number, default: 0 } ,
  description: { type: String, default: "This order is about..." },
  status: { type: String , default : "available"},
  image: { type: String , default : "dish1"},
})

module.exports.Order = mongoose.model("order", orderSchema)