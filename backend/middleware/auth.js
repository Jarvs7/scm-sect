const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // Verificar se o header de autorização existe
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });
    }

    // Extrair o token do header
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Formato de token inválido.' });
    }

    // Verificar e decodificar o token
    const decoded = jwt.verify(token, 'sua_chave_secreta');
    
    // Adicionar os dados do usuário ao objeto de requisição
    req.userData = decoded;
    
    // Prosseguir para o próximo middleware ou rota
    next();
  } catch (error) {
    console.error('Erro de autenticação:', error);
    return res.status(401).json({
      message: 'Autenticação falhou. Token inválido ou expirado.'
    });
  }
};
