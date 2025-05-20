import { io } from "socket.io-client";

// Conectar ao servidor WebSocket
const socket = io("http://192.168.0.92:1120", {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Eventos de conexão
socket.on("connect", () => {
  console.log("🔌 Socket conectado com ID:", socket.id);
});

socket.on("disconnect", () => {
  console.log("Desconectado do servidor WebSocket");
});

socket.on("connect_error", (error) => {
  console.error("Erro de conexão WebSocket:", error);
});

// ✅ Exportações
export default socket;
export const getSocket = () => socket;
