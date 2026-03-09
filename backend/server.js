const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Conectado ao MongoDB da EletroCelo!"))
  .catch((err) => console.error("❌ Erro ao conectar no banco:", err));

const productRoutes = require('./routes/productRoutes');
const saleRoutes = require('./routes/saleRoutes');

app.get('/', (req, res) => {
  res.send("🚀 O servidor do NexStock está rodando e pronto para a EletroCelo!");
});

app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});