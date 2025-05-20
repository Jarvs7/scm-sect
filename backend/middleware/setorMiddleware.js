module.exports = function (req, res, next) {
    const user = req.user;
  
    if (!user) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }
  
    if (user.role === 'admin') return next();
  
    if (user.role?.toLowerCase() === 'transporte') {
      return next();
    }
  
    return res.status(403).json({ message: 'Acesso restrito ao setor de transporte ou admin' });
  };
  