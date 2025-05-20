
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const createUser = async () => {
  try {
    // Conectar ao MongoDB
    await connectDB();
    
    // Definir o esquema do usuário diretamente no script
    const UsuarioSchema = new mongoose.Schema({
      nome: String,
      sobrenome: String,
      username: String,
      senha: String
    });

    // Verificar se o modelo já existe para evitar erros
    const Usuario = mongoose.models.Usuario || mongoose.model('Usuario', UsuarioSchema, 'usuarios');
    
    // Verificar se o usuário já existe
    const usuarioExistente = await Usuario.findOne({ username: 'admin.sistema' });
    
    if (usuarioExistente) {
      console.log('Usuário já existe:', usuarioExistente);
      console.log('Atualizando senha...');
      usuarioExistente.senha = 'admin123';
      await usuarioExistente.save();
      console.log('Senha atualizada com sucesso!');
    } else {
      // Criar novo usuário
      const novoUsuario = new Usuario({
        nome: 'Admin',
        sobrenome: 'Sistema',
        username: 'admin.sistema',
        senha: 'admin123'
      });
      
      await novoUsuario.save();
      console.log('Usuário criado com sucesso!');
    }
    
    // Listar todos os usuários
    const usuarios = await Usuario.find();
    console.log('Usuários no banco de dados:', usuarios);
    
  } catch (error) {
    console.error('Erro ao criar/atualizar usuário:', error);
  } finally {
    mongoose.disconnect();
  }
};

createUser();
