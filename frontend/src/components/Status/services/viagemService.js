// ✅ frontend/src/components/Status/services/viagemService.js
import api from "../../../utils/api";
import { getSocket } from "../../../utils/socket";

// Carrega tudo
export const carregarDados = async () => {
  const [estatisticas, viagens, motoristas, veiculos] = await Promise.all([
    api.get("/viagens/estatisticas"),
    api.get("/viagens"),
    api.get("/viagens/motoristas"),
    api.get("/viagens/veiculos"),
  ]);

  return {
    estatisticas: estatisticas.data,
    viagens: viagens.data,
    motoristas: motoristas.data,
    veiculos: veiculos.data,
  };
};

// Finaliza uma viagem
export const finalizarViagem = async (id) => {
  const response = await api.put(`/viagens/${id}/finalizar`);
  if (response.data.success) {
    const socket = getSocket();
    socket.emit("viagem_finalizada", response.data.viagem);
  }
  return response.data;
};

export { getSocket };
