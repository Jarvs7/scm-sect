const express = require('express');
const router = express.Router();
const Viagem = require('../models/Viagem');
const Motorista = require('../models/Motorista');
const mongoose = require('mongoose');

const obterRelatorios = async (filtros = {}) => {
  try {
    const { dataInicial, dataFinal, motorista, status } = filtros;
    const query = {};

    // Filtros de data
    if (dataInicial && dataFinal) {
      query.saida = {
        $gte: new Date(dataInicial),
        $lte: new Date(new Date(dataFinal).setHours(23, 59, 59, 999))
      };
    }

    // Filtro por motorista
    if (motorista && motorista !== 'todos' && mongoose.Types.ObjectId.isValid(motorista)) {
      query.motorista = new mongoose.Types.ObjectId(motorista);
    }

    // Filtro por status
    if (status && status !== 'todos') {
      query.status = status;
    }

    // Busca as viagens
    const viagens = await Viagem.find(query)
      .populate('motorista', '_id nome')
      .populate('veiculo', 'nome placa')
      .sort({ saida: -1 })
      .lean();

    // Agrupar por motorista (MOVIDO PARA ANTES DO USO)
    const motoristasMap = new Map();
    viagens.forEach(viagem => {
      if (viagem.motorista) {
        const motoristaId = viagem.motorista._id.toString();
        if (!motoristasMap.has(motoristaId)) {
          motoristasMap.set(motoristaId, {
            ...viagem.motorista,
            total: 0
          });
        }
        motoristasMap.get(motoristaId).total++;
      }
    });

    // Calcular estatísticas
    const estatisticas = {
      totalViagens: viagens.length,
      viagensFinalizadas: viagens.filter(v => v.status === 'finalizada').length,
      viagensEmAndamento: viagens.filter(v => v.status === 'em_andamento').length,
      porMotorista: Array.from(motoristasMap.values())
    };

    // Veículos em andamento
    const veiculosEmAndamento = viagens
      .filter(v => v.status === 'em_andamento')
      .map(v => ({
        nome: v.veiculo?.nome || 'Desconhecido',
        placa: v.veiculo?.placa || 'N/A'
      }));

    return {
      estatisticas,
      viagens,
      veiculosEmAndamento
    };
  } catch (error) {
    console.error('Erro ao obter relatórios:', error);
    throw error;
  }
};

// Rota HTTP
router.get('/', async (req, res) => {
  try {
    const data = await obterRelatorios(req.query);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar relatório',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = {
  router,
  obterRelatorios
};