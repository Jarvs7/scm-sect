const mongoose = require('mongoose');
const Motorista = require('../models/Motorista');
const Veiculo = require('../models/Veiculo');

const motoristasTeste = [
  { nome: 'Motorista 1', status: 'disponivel' },
  { nome: 'Motorista 2', status: 'disponivel' },
  { nome: 'Motorista 3', status: 'em_viagem' }
];

const veiculosTeste = [
  { nome: 'Veículo 1', placa: 'ABC-1234', status: 'disponivel' },
  { nome: 'Veículo 2', placa: 'DEF-5678', status: 'disponivel' },
  { nome: 'Veículo 3', placa: 'GHI-9012', status: 'em_viagem' }
];

const adicionarDadosTeste = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/seu_banco_de_dados', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    await Motorista.insertMany(motoristasTeste);
    await Veiculo.insertMany(veiculosTeste);

    console.log('Dados de teste adicionados com sucesso!');
  } catch (error) {
    console.error('Erro ao adicionar dados de teste:', error);
  } finally {
    mongoose.connection.close();
  }
};

adicionarDadosTeste();
