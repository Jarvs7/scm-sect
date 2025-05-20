const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  sobrenome: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
  role: { type: String, enum: ['admin', 'transporte', 'usuario'], default: 'usuario' },
  setor: { type: String } // ✅ novo campo adicionado aqui
}, { collection: 'usuarios' });

module.exports = mongoose.model('Usuario', UsuarioSchema);
