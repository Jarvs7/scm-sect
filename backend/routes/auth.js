const express = require('express');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const authMiddleware = require('../middleware/authMiddleware'); 

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { username, senha } = req.body;

    console.log("Dados recebidos:", username, senha); // <--- ADICIONE ISSO

    const usuario = await Usuario.findOne({ username: username.trim() });

    if (!usuario) {
      return res.status(401).json({ message: 'Usuário não encontrado' });
    }

    if (senha.trim() !== usuario.senha) {
      return res.status(401).json({ message: 'Senha incorreta' });
    }

    const token = jwt.sign(
      {
        id: usuario._id,
        username: usuario.username,
        role: usuario.role || 'usuario',
        setor: usuario.setor || '',
      },
      process.env.JWT_SECRET, 
      { expiresIn: '8h' }
    );
    

    res.json({
      token,
      user: {
        _id: usuario._id,
        nome: usuario.nome,
        username: usuario.username,
        role: usuario.role || 'usuario',
        setor: usuario.setor || ''
      }
    });
    

  } catch (error) {
    console.error('Erro no login:', error); // <--- esse vai mostrar o erro real
    res.status(500).json({ message: 'Erro no servidor' });
  }
});
router.get('/validate', authMiddleware, async (req, res) => {
  try {
    const user = await Usuario.findById(req.user._id).select('-senha');
    if (!user) {
      return res.status(404).json({ valid: false, message: 'Usuário não encontrado' });
    }
    res.status(200).json({ 
      valid: true,
      user: {
        _id: user._id,
        nome: user.nome,
        username: user.username,
        role: user.role,
        setor: user.setor
      }
    });
  } catch (error) {
    console.error('Erro na validação do token:', error);
    res.status(401).json({ valid: false, message: 'Token inválido' });
  }
});

module.exports = router;
