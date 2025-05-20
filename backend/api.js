require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const socketio = require('socket.io');
const http = require('http');
const app = express();
const response = await axios.get(`${process.env.REACT_APP_API_URL}/viagens`);

// Configuração básica
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://192.168.0.92:3000',
    credentials: true
}));
app.use(express.json());

// Conexão com MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
})
.then(() => console.log('✅ Conectado ao MongoDB'))
.catch(err => {
    console.error('❌ Falha na conexão com MongoDB:', err);
    process.exit(1);
});

// Rotas
app.use('/api', require('./routes/viagem'));
app.use('/api', require('./routes/status'));
// Adicione esta rota no seu arquivo api.js
router.put('/viagens/:id/finalizar', async (req, res) => {
    try {
      // Verifica se o conteúdo é JSON
      if (!req.is('application/json')) {
        return res.status(415).json({ error: "Content-Type deve ser application/json" });
      }
  
      const { id } = req.params;
      console.log(`Tentando finalizar viagem ${id}`);
  
      const viagem = await Viagem.findByIdAndUpdate(
        id,
        { status: "finalizada", dataFinalizacao: new Date() },
        { new: true }
      ).populate('motorista veiculo');
  
      if (!viagem) {
        return res.status(404).json({ error: "Viagem não encontrada" });
      }
  
      // Libera recursos
      await Motorista.findByIdAndUpdate(viagem.motorista._id, { disponivel: true });
      await Veiculo.findByIdAndUpdate(viagem.veiculo._id, { disponivel: true });
  
      res.status(200).json({
        success: true,
        message: "Viagem finalizada com sucesso",
        viagem
      });
  
    } catch (error) {
      console.error("Erro no backend:", error);
      res.status(500).json({ 
        error: "Erro interno no servidor",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });
// Configuração do Socket.io
const server = http.createServer(app);
const io = socketio(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://192.168.0.92:3000',
        methods: ["GET", "POST"]
    }
});

require('../sockets/socketHandler')(io);

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: err.message,
        code: err.code || 'SERVER_ERROR' 
    });
});

const PORT = process.env.PORT || 1120;
server.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});

module.exports = app;