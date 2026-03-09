const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Product = require('../models/Product');

// Rota para FINALIZAR VENDA
router.post('/checkout', async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    // 1. Achar o produto no banco
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Produto não encontrado" });

    // 2. Verificar se tem estoque suficiente
    if (product.currentStock < quantity) {
      return res.status(400).json({ message: "Estoque insuficiente!" });
    }

    // 3. Criar a venda
    const totalSalePrice = product.sellPrice * quantity;
    const newSale = new Sale({
      product: productId,
      productName: product.name,
      quantity,
      totalPrice: totalSalePrice
    });

    // 4. ATUALIZAR O ESTOQUE DO PRODUTO (Diminuir)
    product.currentStock -= quantity;

    // 5. Salvar tudo no banco
    await newSale.save();
    await product.save();

    res.status(201).json({ message: "Venda realizada com sucesso!", sale: newSale });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Rota para ver o HISTÓRICO DE VENDAS
router.get('/history', async (req, res) => {
  try {
    const sales = await Sale.find().sort({ soldAt: -1 }); // Mais recentes primeiro
    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Rota para registrar movimentações manuais (Entradas ou Ajustes)
router.post('/log-activity', async (req, res) => {
  try {
    const { productId, productName, quantity, type, note } = req.body;
    
    const newLog = new Sale({
      product: productId,
      productName: productName,
      quantity: quantity, // Pode ser positivo para entrada
      totalPrice: 0, // Entrada manual não gera faturamento de venda
      soldAt: new Date(),
      note: note || "Ajuste de estoque" 
    });

    await newLog.save();
    res.status(201).json({ message: "Movimentação registrada!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;