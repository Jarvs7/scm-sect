const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect('mongodb://localhost:27017/scm', {
    
      // useCreateIndex: true,  // Opcional (descomente se necessário)
      // useFindAndModify: false  // Opcional (descomente se necessário)
    });

    console.log(`✅ MongoDB LOCAL conectado: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ Erro ao conectar ao MongoDB local: ${error.message}`);
    console.log('Verifique se o MongoDB está instalado e rodando no seu computador');
    process.exit(1);
  }
};

module.exports = connectDB;