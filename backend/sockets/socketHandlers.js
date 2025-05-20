const Motorista = require("../models/Motorista");
const Veiculo = require("../models/Veiculo");
const Viagem = require("../models/Viagem");
const mongoose = require("mongoose");

// Função auxiliar para obter relatórios com filtros
const obterRelatoriosComFiltros = async (filtros = {}) => {
  try {
    const { dataInicial, dataFinal, motorista, status } = filtros;
    const query = {};

    // Filtros de data
    if (dataInicial && dataFinal) {
      query.saida = {
        $gte: new Date(dataInicial),
        $lte: new Date(new Date(dataFinal).setHours(23, 59, 59, 999)),
      };
    }

    // Filtro por motorista
    if (motorista) {
      query.motorista = mongoose.Types.ObjectId(motorista);
    }

    // Filtro por status
    if (status) {
      query.status = status;
    }

    // Busca as viagens com populações
    const viagens = await Viagem.find(query)
      .populate("motorista", "nome cnh status")
      .populate("veiculo", "nome placa status")
      .sort({ saida: -1 })
      .lean();

    // Cálculo de estatísticas
    const estatisticas = {
      totalViagens: viagens.length,
      viagensFinalizadas: viagens.filter((v) => v.status === "finalizada")
        .length,
      viagensEmAndamento: viagens.filter((v) => v.status === "em_andamento")
        .length,
      porMotorista: [],
    };

    // Agrupa por motorista
    const motoristasMap = new Map();
    viagens.forEach((viagem) => {
      if (viagem.motorista) {
        const motoristaId = viagem.motorista._id.toString();
        if (!motoristasMap.has(motoristaId)) {
          motoristasMap.set(motoristaId, {
            ...viagem.motorista,
            total: 0,
          });
        }
        motoristasMap.get(motoristaId).total++;
      }
    });

    estatisticas.porMotorista = Array.from(motoristasMap.values());

    return {
      estatisticas,
      viagens,
      veiculosEmAndamento: viagens
        .filter((v) => v.status === "em_andamento")
        .map((v) => ({
          nome: v.veiculo?.nome || "Desconhecido",
          placa: v.veiculo?.placa || "N/A",
        })),
    };
  } catch (error) {
    console.error("Erro ao obter relatórios:", error);
    throw error;
  }
};

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log(`✅ Novo usuário conectado: ${socket.id}`);

    // Handler principal para relatórios
    socket.on("obterRelatorios", async (filtros = {}, callback) => {
      if (typeof callback !== "function") {
        console.error("Callback não é uma função");
        return;
      }

      try {
        console.log("[Socket] Filtros recebidos:", filtros);
        const data = await obterRelatoriosComFiltros(filtros);

        // Resposta via callback
        callback({ success: true, data });

        // Emite também via evento para outros listeners
        socket.emit("dadosRelatorios", data);
      } catch (error) {
        console.error("[Socket] Erro:", error);
        callback({ success: false, error: error.message });
        socket.emit("erroRelatorios", error.message);
      }
    });

    // Obter veículos disponíveis
    socket.on("obterVeiculos", async (callback) => {
      try {
        const veiculos = await Veiculo.find({
          status: { $ne: "em uso" },
        }).lean();

        if (typeof callback === "function") {
          callback({ success: true, data: veiculos });
        }
        socket.emit("atualizarVeiculos", veiculos);
      } catch (error) {
        console.error("❌ Erro ao obter veículos:", error);
        if (typeof callback === "function") {
          callback({ success: false, error: error.message });
        }
        socket.emit("erro", {
          message: "Erro ao carregar veículos",
          type: "erro_interno",
        });
      }
    });

    // Solicitar nova viagem
    socket.on("solicitarViagem", async (data, callback) => {
      console.log("📥 Evento 'solicitarViagem' recebido com dados:", data);

      try {
        const { tipo, saida } = data;

        // Validação manual para tipo normal
        if (tipo === "normal") {
          const dataSaida = new Date(saida);
          const agora = new Date();
          const limite = new Date(agora.getTime() + 24 * 60 * 60 * 1000); // +24h

          if (dataSaida < limite) {
            return callback({
              success: false,
              error:
                "Viagens normais devem ser solicitadas com no mínimo 24h de antecedência",
            });
          }
        }

        // Cria nova viagem
        const novaViagem = new Viagem(data);
        await novaViagem.save();

        // Não atualiza status de motorista/veículo porque ainda está pendente
        // (somente depois da aprovação)

        // Atualiza listas
        const [motoristas, veiculos] = await Promise.all([
          Motorista.find({ status: { $ne: "inativo" } }).lean(),
          Veiculo.find({ status: { $ne: "em uso" } }).lean(),
        ]);

        // Envia sucesso
        if (typeof callback === "function") {
          callback({ success: true });
        }

        socket.emit("viagemRegistrada", {
          message: "Viagem registrada com sucesso!",
        });
        io.emit("atualizarMotoristas", motoristas);
        io.emit("atualizarVeiculos", veiculos);
        io.emit("novaSolicitacaoViagem", novaViagem); // emitir para pendentes atualizarem
      } catch (error) {
        console.error("❌ Erro ao registrar viagem:", error);
        let mensagem = "Erro ao registrar viagem";

        if (error.name === "ValidationError") {
          mensagem =
            "Dados inválidos: " +
            Object.values(error.errors)
              .map((e) => e.message)
              .join(", ");
        }

        if (typeof callback === "function") {
          callback({ success: false, error: mensagem });
        }

        socket.emit("erro", { message: mensagem, type: "erro_interno" });
      }
    });

    // Finalizar viagem
    socket.on("finalizarViagem", async (viagemId, callback) => {
      try {
        const viagem = await Viagem.findById(viagemId);
        if (!viagem) throw new Error("Viagem não encontrada");

        // Atualizar status
        await Motorista.findByIdAndUpdate(viagem.motorista, {
          status: "disponivel",
        });
        await Veiculo.findByIdAndUpdate(viagem.veiculo, {
          status: "disponivel",
        });
        await Viagem.findByIdAndUpdate(viagemId, { status: "finalizada" });

        // Atualizar listas
        const [motoristas, veiculos] = await Promise.all([
          Motorista.find({ status: { $ne: "inativo" } }).lean(),
          Veiculo.find({ status: { $ne: "em uso" } }).lean(),
        ]);

        // Emitir respostas
        if (typeof callback === "function") {
          callback({ success: true });
        }
        socket.emit("viagemFinalizada", {
          message: "Viagem finalizada com sucesso!",
        });
        io.emit("atualizarMotoristas", motoristas);
        io.emit("atualizarVeiculos", veiculos);
      } catch (error) {
        console.error("❌ Erro ao finalizar viagem:", error);
        if (typeof callback === "function") {
          callback({ success: false, error: error.message });
        }
        socket.emit("erro", {
          message: "Erro ao finalizar viagem",
          type: "erro_interno",
        });
      }
    });

    // Obter motoristas
    socket.on("obterMotoristas", async (callback) => {
      try {
        const motoristas = await Motorista.find({
          status: { $in: ["disponivel", "em_viagem"] },
        })
          .sort({ nome: 1 })
          .lean();

        const resposta = motoristas.map((m) => ({
          _id: m._id,
          nome: m.nome,
          cnh: m.cnh,
          status: m.status,
        }));

        if (typeof callback === "function") {
          callback({ success: true, data: resposta });
        }
        socket.emit("atualizarMotoristas", resposta);
      } catch (error) {
        console.error("❌ Erro ao buscar motoristas:", error);
        if (typeof callback === "function") {
          callback({ success: false, error: error.message });
        }
        socket.emit("erro", {
          message: "Erro ao carregar motoristas",
          type: "erro_interno",
        });
      }
    });

    // Tratamento de erros e desconexão
    socket.on("error", (error) => {
      console.error("Erro de conexão:", error);
    });

    socket.on("disconnect", () => {
      console.log(`❌ Usuário desconectado: ${socket.id}`);
    });
  });
};
