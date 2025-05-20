module.exports = {
  apps: [{
    name: "sistema-chamados-react",
    script: "./server.js",
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: "800M",
    exec_mode: "fork",
    wait_ready: true,
    listen_timeout: 15000,  // Aumentado para conexões mais lentas
    kill_timeout: 8000,     // Tempo extra para shutdown seguro
    env: {
      NODE_ENV: "production",
      PORT: 1120,
      HOST: "0.0.0.0",      // Adicionado para binding explícito
      MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/chamados",
      JWT_SECRET: process.env.JWT_SECRET || "seuSegredoSuperSecreto",
      SOCKET_TIMEOUT: "60000" // Timeout para Socket.IO
    },
    env_production: {
      NODE_ENV: "production",
      // Sobrescreva aqui variáveis específicas de produção
    },
    error_file: "./logs/pm2-error.log",
    out_file: "./logs/pm2-out.log",
    log_date_format: "YYYY-MM-DD HH:mm:ss.SSS", // Mais preciso
    merge_logs: true,
    time: true  // Adiciona timestamp nos logs
  }]
};