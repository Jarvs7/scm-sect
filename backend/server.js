require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const cors = require("cors");
const mongoose = require("mongoose");
const os = require("os");
const net = require("net");

// Importações locais
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const usuariosRoutes = require("./routes/usuarios");
const viagensRoutes = require("./routes/viagem");
const statusRoutes = require("./routes/status");
const relatoriosRoutes = require("./routes/relatorio");
const socketHandlers = require("./sockets/socketHandlers");
const veiculosRoutes = require("./routes/veiculos");
const motoristasRoutes = require("./routes/motoristas");
const Motorista = require("./models/Motorista");
const Viagem = require("./models/Viagem");

const app = express();

// 🔐 CORS padrão para API - Libera todas as máquinas 192.168.0.* a 192.168.4.*
const allowedOrigins = [
  // Padrão regex para todas as faixas IP necessárias
  /^http:\/\/192\.168\.[0-4]\.\d{1,3}(:\d+)?$/,

  // Endereços específicos
  "http://192.168.0.92",
  "http://192.168.0.92:1120",
  "http://192.168.0.92:3000",
  "http://scm.sect.br:1120",
  "http://localhost:3000",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Permite requisições sem origin

    const isAllowed = allowedOrigins.some((allowed) => {
      if (typeof allowed === "string") {
        return origin.startsWith(allowed);
      } else if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return false;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      console.log("🚨 Origem bloqueada por CORS:", origin);
      callback(new Error("Acesso não permitido por política de CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de log para debug
app.use((req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.path} | Origin: ${
      req.headers.origin
    }`
  );
  next();
});

// Conectar ao MongoDB
connectDB();

// Rota de teste
app.get("/teste", (req, res) => {
  res.json({ message: "Servidor está funcionando!" });
});

// Rotas principais
app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/viagens", viagensRoutes);
app.use("/api/status", statusRoutes);
app.use("/api/relatorios", relatoriosRoutes.router);
app.use("/api/veiculos", veiculosRoutes);
app.use("/api/motoristas", motoristasRoutes);

// Rota adicional: motoristas disponíveis
app.get("/api/motoristas/disponiveis", async (req, res) => {
  try {
    const motoristas = await Motorista.find({
      status: { $in: ["disponivel", "em_viagem"] },
    }).sort({ nome: 1 });

    res.json({ success: true, data: motoristas });
  } catch (error) {
    console.error("Erro ao buscar motoristas:", error);
    res
      .status(500)
      .json({ success: false, message: "Erro ao buscar motoristas" });
  }
});

// Rota adicional: relatório de motoristas com viagens
app.get("/api/motoristas/relatorio", async (req, res) => {
  try {
    const { dataInicial, dataFinal } = req.query;
    if (!dataInicial || !dataFinal) {
      return res.status(400).json({
        success: false,
        message: "Datas obrigatórias",
      });
    }

    const dataInicio = new Date(dataInicial);
    const dataFim = new Date(dataFinal);
    dataFim.setHours(23, 59, 59, 999);

    const motoristas = await Motorista.find({
      status: { $in: ["disponivel", "em_viagem", "livre", "inativo"] },
    }).sort({ nome: 1 });

    const motoristasComViagens = await Promise.all(
      motoristas.map(async (motorista) => {
        const viagens = await Viagem.find({
          motorista: motorista._id,
          data_inicio: { $gte: dataInicio, $lte: dataFim },
        });

        return {
          _id: motorista._id,
          nome: motorista.nome,
          status: motorista.status,
          totalViagens: viagens.length,
          viagens: viagens.map((v) => ({
            _id: v._id,
            origem: v.origem,
            destino: v.destino,
            data_inicio: v.data_inicio,
            data_fim: v.data_fim,
          })),
        };
      })
    );

    res.json({ success: true, data: motoristasComViagens });
  } catch (error) {
    console.error("Erro ao buscar motoristas com viagens:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar dados dos motoristas",
    });
  }
});

// Consulta de viagens com filtros
app.get("/api/viagens", async (req, res) => {
  try {
    const { motorista, dataInicial, dataFinal } = req.query;
    const filtro = {};

    if (motorista) filtro.motorista = new mongoose.Types.ObjectId(motorista);
    if (dataInicial && dataFinal) {
      filtro.saida = {
        $gte: new Date(dataInicial),
        $lte: new Date(new Date(dataFinal).setHours(23, 59, 59, 999)),
      };
    }

    const viagens = await Viagem.find(filtro)
      .populate("motorista", "nome cnh")
      .populate("veiculo", "nome placa")
      .sort({ saida: -1 });

    res.json(viagens);
  } catch (error) {
    console.error("Erro ao buscar viagens:", error);
    res.status(500).json({ error: "Erro ao buscar viagens" });
  }
});

// 🧱 Servir React em produção
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend/build", "index.html"));
  });
}

// Configuração do Socket.IO com CORS amplo
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      /^http:\/\/192\.168\.[0-4]\.\d{1,3}(:\d+)?$/,
      "http://scm.sect.br:1120",
      "http://192.168.0.92:3000",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
  allowEIO3: true, // Adicione para compatibilidade
});

// Configurações de Socket.IO (mantenha suas configurações existentes)
io.engine.on("connection_error", (err) => {
  console.log("Erro de conexão Socket.IO:", err);
});

io.use((socket, next) => {
  console.log(
    `⚡ Nova conexão: ${socket.id} | IP: ${socket.handshake.address}`
  );
  next();
});

socketHandlers(io);

// ======================================================
// INICIALIZAÇÃO AVANÇADA DO SERVIDOR
// ======================================================

const PORT = process.env.PORT || 1120;

// Controle de timeout
server.keepAliveTimeout = 60000;
server.headersTimeout = 65000;

// Verificação de porta
const checkPort = () =>
  new Promise((resolve) => {
    const tester = net
      .createServer()
      .once("error", () => resolve(true))
      .once("listening", () => {
        tester.close(() => resolve(false));
      })
      .listen(PORT);
  });

// Shutdown gracioso
const gracefulShutdown = (signal) => {
  console.log(`\nRecebido ${signal}, encerrando servidor...`);

  server.close(() => {
    console.log("Servidor HTTP fechado");
    mongoose.connection.close(false, () => {
      console.log("MongoDB desconectado");
      process.exit(0);
    });
  });

  setTimeout(() => {
    console.error("Forçando encerramento após timeout");
    process.exit(1);
  }, 10000);
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

// Inicialização segura
async function startServer() {
  try {
    if (await checkPort()) {
      console.error(`🚨 Porta ${PORT} já está em uso!`);
      process.exit(1);
    }

    server.listen(PORT, "0.0.0.0", () => {
      const networkInterfaces = os.networkInterfaces();
      const ips = Object.values(networkInterfaces)
        .flat()
        .filter((i) => i.family === "IPv4" && !i.internal)
        .map((i) => i.address);

      console.log(`
      ====================================
      ✅ Servidor rodando na porta ${PORT}
      🔗 Acessível em:
      Local:    http://192.168.0.92:${PORT}
      Rede:     ${ips.map((ip) => `http://${ip}:${PORT}`).join("\n           ")}
      📡 Socket.IO: ws://192.168.0.92:${PORT}/socket.io/
      ====================================
      `);

      if (process.send) process.send("ready");
    });
  } catch (err) {
    console.error("Erro ao iniciar servidor:", err);
    process.exit(1);
  }
}

startServer();

// Middleware global de erro
app.use((err, req, res, next) => {
  console.error("Erro não tratado:", err.message);
  res.status(500).json({ error: "Erro interno no servidor" });
});
