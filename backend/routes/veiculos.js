const express = require('express');
const router = express.Router(); // ❗ ISSO PRECISA VIR ANTES das rotas
const Veiculo = require('../models/Veiculo');

// ✅ Lista todos os veículos
router.get('/', async (req, res) => {
  try {
    const veiculos = await Veiculo.find().select('nome _id');
    res.json(veiculos);
  } catch (err) {
    console.error('Erro ao buscar veículos:', err);
    res.status(500).json({ message: 'Erro ao buscar veículos' });
  }
});

// ✅ Lista apenas veículos disponíveis
router.get('/disponiveis', async (req, res) => {
  try {
    const veiculos = await Veiculo.find({ status: 'disponivel' }).select('nome placa _id');
    res.json(veiculos);
  } catch (err) {
    console.error('Erro ao buscar veículos disponíveis:', err);
    res.status(500).json({ message: 'Erro ao buscar veículos disponíveis' });
  }
});

module.exports = router;
