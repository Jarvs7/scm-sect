const express = require("express");
const router = express.Router();
const Motorista = require("../models/Motorista");
const Veiculo = require("../models/Veiculo");
const Viagem = require("../models/Viagem");
const auth = require('../middleware/auth');

// Rota para listar motoristas
router.get('/motoristas', async (req, res) => {
  try {
    const motoristas = await Motorista.find();
    res.json(motoristas);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar motoristas", error });
  }
});
  app.use('/api', router);
// Rota para criar um motorista
router.post("/motoristas", async (req, res) => {
    try {
        const { nome, cnh, telefone, data_nascimento } = req.body;

        if (!nome || !cnh) {
            return res.status(400).json({ message: "Nome e CNH são obrigatórios!" });
        }

        const motoristaExistente = await Motorista.findOne({ cnh });
        if (motoristaExistente) {
            return res.status(400).json({ message: "CNH já cadastrada!" });
        }

        const novoMotorista = new Motorista({
            nome,
            cnh,
            telefone,
            data_nascimento: data_nascimento ? new Date(data_nascimento) : null,
        });

        await novoMotorista.save();

        res.status(201).json({ message: "Motorista adicionado com sucesso!", motorista: novoMotorista });
    } catch (error) {
        console.error("❌ Erro ao adicionar motorista:", error);
        res.status(500).json({ message: "Erro ao adicionar motorista", error: error.message });
    }
});
// Rotas protegidas (requerem autenticação)
router.get('/viagens', auth, async (req, res) => {
    try {
      const viagens = await Viagem.find().sort({ dataCriacao: -1 });
      res.json(viagens);
    } catch (error) {
      console.error('Erro ao buscar viagens:', error);
      res.status(500).json({ message: 'Erro ao buscar viagens' });
    }
  });

  // Rota para obter veículos
router.get('/veiculos', async (req, res) => {
  try {
    const veiculos = await Veiculo.find();
    res.json(veiculos);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar veículos", error });
  }
});
module.exports = router;