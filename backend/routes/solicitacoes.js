// routes/solicitacoes.js

const express = require('express');
const router = express.Router();
const Viagem = require('../models/Viagem');

// POST /api/solicitacoes
router.post('/solicitacoes', async (req, res) => {
  try {
    const {
      origem,
      destino,
      dataSolicitada,
      motivo,
      solicitante,
    } = req.body;

    const novaViagem = new Viagem({
      origem,
      destino,
      dataSolicitada,
      motivo,
      solicitante, // { nome, setor }
    });

    await novaViagem.save();
    res.status(201).json({ success: true, message: 'Viagem solicitada com sucesso!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao solicitar viagem' });
  }
});

module.exports = router;
