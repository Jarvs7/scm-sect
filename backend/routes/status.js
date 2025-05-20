const express = require("express");
const Viagem = require("../models/Viagem");
const Motorista = require("../models/Motorista");
const Veiculo = require("../models/Veiculo");
const router = express.Router();

// Buscar status das viagens, motoristas e veículos
router.get("/status", async (req, res) => {
  try {
    // Busca todas as viagens com motorista e veículo populados
    const viagens = await Viagem.find()
      .populate("motorista", "nome cnh status")
      .populate("veiculo", "nome placa status");

    // Busca todos os motoristas
    const motoristas = await Motorista.find();

    // Busca todos os veículos
    const veiculos = await Veiculo.find();

    // Calcula estatísticas
    const viagensEmAndamento = viagens.filter(
      (v) => v.status === "em_andamento"
    ).length;

    const veiculosDisponiveis = veiculos.filter(
      (v) => v.status === "livre" || v.status === "disponivel"
    ).length;

    const motoristasDisponiveis = motoristas.filter(
      (m) => m.status === "livre" || m.status === "disponivel"
    ).length;


    // Retorna os dados
    res.json({
      estatisticas: {
        viagensEmAndamento,
        veiculosDisponiveis,
        motoristasDisponiveis,
      },
      viagens,
      motoristas,
      veiculos,
    });
  } catch (error) {
    console.error("Erro ao buscar status:", error);
    res.status(500).json({ message: "Erro ao buscar status", error });
  }
});

module.exports = router;
