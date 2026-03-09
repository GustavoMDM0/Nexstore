const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Product = require('../models/Product');

router.post('/checkout', async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Produto não encontrado" });

    if (product.currentStock < quantity) {
      return res.status(400).json({ message: "Estoque insuficiente!" });
    }

    const totalSalePrice = product.sellPrice * quantity;
    const newSale = new Sale({
      product: productId,
      productName: product.name,
      quantity,
      totalPrice: totalSalePrice
    });

    // Lógica de alteração de estoque comentada para proteção de dados do portfólio
    // product.currentStock -= quantity;
    // await product.save();

    await newSale.save();

    res.status(201).json({ 
      message: "Venda realizada com sucesso! (Modo de Demonstração: Estoque preservado)", 
      sale: newSale 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/history', async (req, res) => {
  try {
    const sales = await Sale.find().sort({ soldAt: -1 });
    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/log-activity', async (req, res) => {
  try {
    const { productId, productName, quantity, type, note } = req.body;
    
    const newLog = new Sale({
      product: productId,
      productName: productName,
      quantity: quantity,
      totalPrice: 0,
      soldAt: new Date(),
      note: note || "Ajuste de estoque" 
    });

    await newLog.save();
    res.status(201).json({ message: "Movimentação registrada!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Rota de DELETE desabilitada para evitar perda de dados por usuários externos
// router.delete('/:id', (req, res) => {
//   res.status(403).json({ message: "A exclusão de registros está desabilitada nesta versão de teste." });
// });

module.exports = router;