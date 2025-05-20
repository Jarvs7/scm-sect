module.exports = (roles) => {
  return (req, res, next) => {
    if (!req.userData) {
      return res.status(401).json({ message: 'Não autenticado' });
    }
    
    if (!roles.includes(req.userData.cargo)) {
      return res.status(403).json({ message: 'Acesso negado. Permissão insuficiente.' });
    }
    
    next();
  };
};
