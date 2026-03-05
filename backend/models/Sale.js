const mongoose = require('mongoose');

const SaleSchema = new mongoose.Schema({
  product: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true 
  },
  productName: String,
  quantity: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  soldAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Sale', SaleSchema);