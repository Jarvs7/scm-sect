const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario');
const auth = require('../middleware/auth');

// Obter todos os usuários (apenas admin)
router.get('/usuarios', auth, async (req, res) => {
  try {
    // Verificar se o usuário é admin
    if (req.userData.cargo !== 'admin') {
      return res.status(403).json({ message: 'Acesso negado' });
    }
    
    const usuarios = await Usuario.find().select('-senha').sort({ nome: 1 });
    res.json(usuarios);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ message: 'Erro ao buscar usuários' });
  }
});

// Obter um usuário específico (apenas admin ou o próprio usuário)
router.get('/usuarios/:id', auth, async (req, res) => {
  try {
    // Verificar se é admin ou o próprio usuário
    if (req.userData.cargo !== 'admin' && req.userData.id !== req.params.id) {
      return res.status(403).json({ message: 'Acesso negado' });
    }
    
    const usuario = await Usuario.findById(req.params.id).select('-senha');
    
    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    res.json(usuario);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ message: 'Erro ao buscar usuário' });
  }
});

// Atualizar um usuário (apenas admin ou o próprio usuário)
router.put('/usuarios/:id', auth, async (req, res) => {
  try {
    // Verificar se é admin ou o próprio usuário
    if (req.userData.cargo !== 'admin' && req.userData.id !== req.params.id) {
      return res.status(403).json({ message: 'Acesso negado' });
    }
    
    const { nome, sobrenome, username, senha, setor } = req.body;

    
    // Verificar se o username ou email já está em uso por outro usuário
    const usuarioExistente = await Usuario.findOne({
      $and: [
        { _id: { $ne: req.params.id } },
        { $or: [{ username }, { email }] }
      ]
    });
    
    if (usuarioExistente) {
      return res.status(400).json({ 
        message: 'Nome de usuário ou email já está em uso por outro usuário' 
      });
    }
    
    // Buscar o usuário a ser atualizado
    const usuario = await Usuario.findById(req.params.id);
    
    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    usuario.nome = nome;
    usuario.sobrenome = sobrenome;
    usuario.username = username;
    
    if (senha && senha.trim() !== '') {
      usuario.senha = senha;
    }
    
    usuario.setor = setor;
    
    // Só permitir que admin altere o cargo
    if (req.userData.cargo === 'admin') {
      usuario.cargo = cargo;
      usuario.setor = setor;
    }
    
    await usuario.save();
    
    res.json({ message: 'Usuário atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ message: 'Erro ao atualizar usuário' });
  }
});

// Alternar status do usuário (apenas admin)
router.patch('/usuarios/:id/status', auth, async (req, res) => {
  try {
    // Verificar se o usuário é admin
    if (req.userData.cargo !== 'admin') {
      return res.status(403).json({ message: 'Acesso negado' });
    }
    
    const { ativo } = req.body;
    
    const usuario = await Usuario.findById(req.params.id);
    
    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    // Não permitir desativar o próprio usuário
    if (req.userData.id === req.params.id && ativo === false) {
      return res.status(400).json({ message: 'Você não pode desativar sua própria conta' });
    }
    
    usuario.ativo = ativo;
    await usuario.save();
    
    res.json({ message: 'Status do usuário atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar status do usuário:', error);
    res.status(500).json({ message: 'Erro ao atualizar status do usuário' });
  }
});

module.exports = router;
