const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, unique: true, required: true },
  category: { type: String, default: "Eletrônicos" },
  costPrice: { type: Number, required: true },
  sellPrice: { type: Number, required: true },
  currentStock: { type: Number, default: 0 },
  minStock: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', ProductSchema);