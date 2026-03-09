const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// --- CONFIGURAÇÕES / MIDDLEWARES ---
app.use(express.json());
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// --- CONEXÃO COM O BANCO (MongoDB Atlas) ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Conectado ao MongoDB da EletroCelo!"))
  .catch((err) => console.error("❌ Erro ao conectar no banco:", err));

// --- IMPORTAÇÃO DAS ROTAS ---
const productRoutes = require('./routes/productRoutes');
const saleRoutes = require('./routes/saleRoutes');

// --- DEFINIÇÃO DAS ROTAS (ENDPOINTS) ---

// Rota base para verificar se o servidor está online
app.get('/', (req, res) => {
  res.send("🚀 O servidor do NexStock está rodando e pronto para a EletroCelo!");
});

// Rotas de Produtos (Cadastro, Listagem, Edição, Deleção e Estatísticas)
app.use('/api/products', productRoutes);

// Rotas de Vendas (Checkout de novos itens e Histórico de vendas)
app.use('/api/sales', saleRoutes);

// --- INICIALIZAÇÃO DO SERVIDOR ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});