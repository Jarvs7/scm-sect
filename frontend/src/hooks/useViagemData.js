import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  carregarDados,
  finalizarViagem,
  getSocket,
} from "../components/Status/services/viagemService";

const useViagemData = () => {
  const [dados, setDados] = useState({
    estatisticas: {
      totalViagens: 0,
      viagensFinalizadas: 0,
      viagensEmAndamento: 0,
    },
    viagens: [],
    motoristas: [],
    veiculos: [],
    _initialized: false
  });

  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await carregarDados();

      setDados({
        estatisticas: data.estatisticas || {},
        viagens: data.viagens || [],
        motoristas: Array.isArray(data.motoristas) ? data.motoristas : [],
        veiculos: Array.isArray(data.veiculos) ? data.veiculos : [],
        _initialized: true
      });
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(); // carregamento inicial
    const socket = getSocket();

    // Atualização em tempo real via socket
    socket.on("atualizacao_viagens", (data) => {
      setDados((prev) => ({
        ...prev,
        viagens: data.viagens || prev.viagens,
        estatisticas: data.estatisticas || prev.estatisticas,
        motoristas: data.motoristas || prev.motoristas,
        veiculos: data.veiculos || prev.veiculos,
      }));
    });

    return () => socket.off("atualizacao_viagens");
  }, []);

  return {
    dados,
    setDados,
    loading,
    setLoading,
    loadData,
    finalizarViagem,
  };
};

export default useViagemData;
