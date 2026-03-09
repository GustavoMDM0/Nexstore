const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// *** ROTA DE ESTATÍSTICAS ***
router.get('/stats/dashboard', async (req, res) => {
  try {
    const products = await Product.find();
    const Sale = require('../models/Sale'); // Precisamos importar o model de vendas aqui
    const sales = await Sale.find();

    let totalStockValue = 0;
    let lowStockCount = 0;
    
    // Cálculo de Estoque
    products.forEach(product => {
      totalStockValue += (product.sellPrice * product.currentStock);
      if (product.currentStock <= product.minStock) {
        lowStockCount++;
      }
    });

    // Cálculo de Faturamento (Vendas do Mês)
    const monthlyRevenue = sales.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);

    res.json({ 
      totalProducts: products.length, 
      totalStockValue, 
      lowStockCount,
      monthlyRevenue 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// 1. ADICIONAR (Create)
router.post('/add', async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 2. VER TODOS (Read)
router.get('/all', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. BUSCAR UM ESPECÍFICO (Read by ID)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Produto não encontrado" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. EDITAR (Update)
router.put('/update/:id', async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 5. DELETAR (Delete)
router.delete('/delete/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Produto removido com sucesso!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;