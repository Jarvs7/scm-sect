// ✅ backend/routes/viagem.js — ATUALIZADO (sem transações)
const express = require("express");
const mongoose = require("mongoose");
const Viagem = require("../models/Viagem");
const Motorista = require("../models/Motorista");
const Veiculo = require("../models/Veiculo");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const setorMiddleware = require("../middleware/setorMiddleware");

const router = express.Router();
const ObjectId = mongoose.Types.ObjectId;

// ===================== VIAGENS ===================== //

// Buscar todas as viagens com filtros
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { motorista, status, dataInicial, dataFinal } = req.query;
    const filtro = {};

    if (motorista) filtro.motorista = motorista;
    if (status) filtro.status = status;
    if (dataInicial && dataFinal) {
      filtro.saida = {
        $gte: new Date(dataInicial),
        $lte: new Date(`${dataFinal}T23:59:59.999Z`),
      };
    }

    const viagens = await Viagem.find(filtro)
      .sort({ dataCriacao: -1 })
      .populate("motorista", "nome")
      .populate("veiculo", "nome placa");

    res.json(viagens);
  } catch (error) {
    console.error("Erro ao buscar viagens:", error);
    res.status(500).json({ message: "Erro ao buscar viagens", error });
  }
});

// Estatísticas de viagens
router.get("/estatisticas", authMiddleware, setorMiddleware, async (req, res) => {
  try {
    const totalViagens = await Viagem.countDocuments();
    const viagensFinalizadas = await Viagem.countDocuments({ status: "finalizada" });
    const viagensEmAndamento = await Viagem.countDocuments({ status: "em_andamento" });

    res.json({ totalViagens, viagensFinalizadas, viagensEmAndamento });
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    res.status(500).json({ message: "Erro ao buscar estatísticas", error });
  }
});

// Viagens pendentes
router.get("/pendentes", authMiddleware, async (req, res) => {
  try {
    const viagensPendentes = await Viagem.find({ status: "pendente" })
      .populate("motorista", "nome")
      .populate("veiculo", "nome placa");

    res.json(viagensPendentes);
  } catch (error) {
    console.error("Erro ao buscar viagens pendentes:", error);
    res.status(500).json({ message: "Erro ao buscar viagens pendentes", error });
  }
});

// Aprovar viagem (SEM transações)
router.patch("/:id/aprovar", authMiddleware, setorMiddleware, async (req, res) => {
  try {
    const { motorista, veiculo, aprovador } = req.body;

    const viagem = await Viagem.findById(req.params.id);
    if (!viagem) throw new Error("Viagem não encontrada");

    if (viagem.tipo === "urgente") {
      const user = req.user;
      if (!["admin", "supervisor", "gerente"].includes(user.role)) {
        throw new Error("Apenas superiores podem aprovar viagens urgentes");
      }
    }

    if (viagem.tipo === "normal") {
      const agora = new Date();
      const dataPartida = new Date(viagem.saida || viagem.data_partida);
      const horasDeAntecedencia = (dataPartida - agora) / 36e5;
    
      if (horasDeAntecedencia < 24) {
        const user = req.user;
        if (user.role !== "admin") {
          throw new Error("Apenas administradores podem aprovar viagens normais com menos de 24h de antecedência.");
        }
      }
    }
    

    const [motoristaDisponivel, veiculoDisponivel] = await Promise.all([
      Motorista.findOne({ _id: motorista, status: "disponivel" }),
      Veiculo.findOne({ _id: veiculo, status: "disponivel" }),
    ]);

    if (!motoristaDisponivel || !veiculoDisponivel) {
      throw new Error("Motorista ou veículo não disponível");
    }

    const viagemAprovada = await Viagem.findByIdAndUpdate(
      req.params.id,
      {
        motorista,
        veiculo,
        aprovador,
        status: "em_andamento",
        dataAprovacao: new Date(),
      },
      { new: true }
    );

    await Promise.all([
      Motorista.findByIdAndUpdate(motorista, { status: "em_viagem" }),
      Veiculo.findByIdAndUpdate(veiculo, { status: "em_uso" }),
    ]);

    res.json({
      success: true,
      message: "Viagem aprovada com sucesso",
      viagem: viagemAprovada,
    });

  } catch (error) {
    console.error("Erro ao aprovar viagem:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Erro ao aprovar viagem",
    });
  }
});

// Finalizar viagem (SEM transações)
router.put("/:id/finalizar", authMiddleware, async (req, res) => {
  try {
    const objectId = new ObjectId(req.params.id);
    const viagem = await Viagem.findByIdAndUpdate(
      objectId,
      { status: "finalizada", dataHoraRetorno: new Date() },
      { new: true }
    ).populate("motorista veiculo");

    if (!viagem) throw new Error("Viagem não encontrada");

    if (viagem.motorista) {
      await Motorista.findByIdAndUpdate(viagem.motorista._id, { status: "disponivel" });
    }
    if (viagem.veiculo) {
      await Veiculo.findByIdAndUpdate(viagem.veiculo._id, { status: "disponivel" });
    }

    const [viagensAtualizadas, estatisticasAtualizadas] = await Promise.all([
      Viagem.find().populate("motorista", "nome").populate("veiculo", "nome placa"),
      Viagem.aggregate([
        {
          $group: {
            _id: null,
            totalViagens: { $sum: 1 },
            viagensFinalizadas: {
              $sum: { $cond: [{ $eq: ["$status", "finalizada"] }, 1, 0] },
            },
            viagensEmAndamento: {
              $sum: { $cond: [{ $eq: ["$status", "em_andamento"] }, 1, 0] },
            },
          },
        },
      ]),
    ]);

    if (req.io) {
      req.io.emit("atualizacao_viagens", {
        tipo: "viagem_finalizada",
        viagens: viagensAtualizadas,
        estatisticas: estatisticasAtualizadas[0] || {
          totalViagens: 0,
          viagensFinalizadas: 0,
          viagensEmAndamento: 0,
        },
      });
    }

    res.json({
      success: true,
      message: "Viagem finalizada com sucesso",
      viagem,
    });

  } catch (error) {
    console.error("Erro ao finalizar viagem:", error);
    res.status(error.message === "Viagem não encontrada" ? 404 : 500).json({
      success: false,
      message: error.message || "Erro ao finalizar viagem",
      error: error.message,
    });
  }
});

// ===================== MOTORISTAS ===================== //

router.get("/motoristas", authMiddleware, async (req, res) => {
  try {
    const { status } = req.query;
    const filtro = status ? { status } : {};
    const motoristas = await Motorista.find(filtro);
    res.json(motoristas);
  } catch (error) {
    console.error("Erro ao buscar motoristas:", error);
    res.status(500).json({ message: "Erro ao buscar motoristas", error });
  }
});

router.get("/motoristas/disponiveis", authMiddleware, async (req, res) => {
  try {
    const motoristas = await Motorista.find({ status: "disponivel" });
    res.json(motoristas);
  } catch (error) {
    console.error("Erro ao buscar motoristas disponíveis:", error);
    res.status(500).json({ message: "Erro ao buscar motoristas disponíveis", error });
  }
});

// Criar nova viagem
router.post("/", authMiddleware, async (req, res) => {
  try {
    const viagem = new Viagem(req.body);
    await viagem.validate();
    const novaViagem = await viagem.save();

    res.status(201).json({ success: true, viagem: novaViagem });
  } catch (error) {
    console.error("Erro ao registrar viagem:", error.message);
    res.status(400).json({
      success: false,
      message: error.message || "Erro ao registrar viagem",
    });
  }
});

// ===================== VEÍCULOS ===================== //

router.get("/veiculos", authMiddleware, async (req, res) => {
  try {
    const veiculos = await Veiculo.find();
    res.json(veiculos);
  } catch (error) {
    console.error("Erro ao buscar veículos:", error);
    res.status(500).json({ message: "Erro ao buscar veículos", error });
  }
});

router.get("/veiculos/disponiveis", authMiddleware, async (req, res) => {
  try {
    const veiculos = await Veiculo.find({ status: "disponivel" });
    res.json(veiculos);
  } catch (error) {
    console.error("Erro ao buscar veículos disponíveis:", error);
    res.status(500).json({ message: "Erro ao buscar veículos disponíveis", error });
  }
});

// ===================== REJEITAR VIAGEM ===================== //

router.patch("/:id/rejeitar", authMiddleware, setorMiddleware, async (req, res) => {
  try {
    const { motivo } = req.body;

    const viagem = await Viagem.findByIdAndUpdate(
      req.params.id,
      {
        status: "rejeitada",
        motivoRejeicao: motivo,
        dataRejeicao: new Date(),
      },
      { new: true }
    );

    if (!viagem) {
      return res.status(404).json({ success: false, message: "Viagem não encontrada" });
    }

    res.json({
      success: true,
      message: "Viagem rejeitada com sucesso",
      viagem,
    });

  } catch (error) {
    console.error("Erro ao rejeitar viagem:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao rejeitar viagem",
      error: error.message,
    });
  }
});

module.exports = router;
