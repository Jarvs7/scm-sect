const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

module.exports = async function (req, res, next) {
  const authHeader = req.headers.authorization;
  console.log('Headers recebidos:', {
    authorization: authHeader ? `${authHeader.substring(0, 20)}...` : 'Não informado',
    host: req.headers.host,
    origin: req.headers.origin
  });

  const token = authHeader?.split(' ')[1];
  console.log('Token para validação:', token ? `${token.substring(0, 10)}...` : 'Nenhum token');



  if (!token) {
    console.warn("❌ Token ausente no header");
    return res.status(401).json({ message: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'chave-secreta');
    const usuario = await Usuario.findById(decoded.id).select('-senha');

    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    req.user = usuario;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' });
  }
};
