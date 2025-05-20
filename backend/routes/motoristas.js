const express = require('express');
const router = express.Router();
const Motorista = require('../models/Motorista');

// ✅ GET /api/motoristas — Lista todos os motoristas
router.get('/', async (req, res) => {
  try {
    const motoristas = await Motorista.find().select('nome _id');
    res.json(motoristas);
  } catch (err) {
    console.error('Erro ao buscar motoristas:', err);
    res.status(500).json({ message: 'Erro ao buscar motoristas' });
  }
});

// ✅ GET /api/motoristas/disponiveis — Lista apenas motoristas disponíveis
router.get('/disponiveis', async (req, res) => {
  try {
    const motoristas = await Motorista.find({ status: 'disponivel' }).select('nome _id');
    res.json(motoristas);
  } catch (err) {
    console.error('Erro ao buscar motoristas disponíveis:', err);
    res.status(500).json({ message: 'Erro ao buscar motoristas disponíveis' });
  }
});

module.exports = router;
