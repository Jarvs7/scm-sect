module.exports = function (req, res, next) {
  if (!req.user || !["admin", "supervisor", "transporte"].includes(req.user.role)) {
    return res.status(403).json({ message: "Acesso restrito" });
  }
  next();
};
