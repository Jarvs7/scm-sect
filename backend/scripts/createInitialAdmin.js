const mongoose = require('mongoose');
const Usuario = require('../models/Usuario');
const connectDB = require('../config/db');
require('dotenv').config();

const createInitialAdmin = async () => {
  try {
    await connectDB();
    
    // Verificar se já existe algum usuário admin
    const adminExists = await Usuario.findOne({ cargo: 'admin' });
    
    if (adminExists) {
      console.log('Usuário admin já existe!');
      process.exit(0);
    }
    
    // Criar usuário admin inicial
    const novoAdmin = new Usuario({
      nome: 'Admin',
      sobrenome: 'Sistema',
      username: 'admin.sistema',
      email: 'admin@sistema.com',
      senha: 'admin123', // Será hasheada automaticamente pelo middleware
      cargo: 'admin',
      setor: 'Transporte'
    });
    
    await novoAdmin.save();
    console.log('Usuário admin criado com sucesso!');
    
  } catch (error) {
    console.error('Erro ao criar usuário inicial:', error);
  } finally {
    mongoose.disconnect();
  }
};

createInitialAdmin();
