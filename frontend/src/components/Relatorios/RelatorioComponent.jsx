import React, { useState } from "react";
import { useSocket } from "../../context/SocketContext";
import CardsDashboard from "./CardsDashboard";
import Filtros from "./Filtros.tsx";
import Graficos from "./Graficos";
import TabelaViagens from "./TabelaViagens";
import ExportarRelatorios from "./ExportarRelatorios";
import Header from "./Header.jsx";
import "../../styles/Relatorio/relatorio.css";

const RelatorioComponent = () => {
  const { dadosRelatorios, loading, socket } = useSocket();
  const [filtrosAplicados, setFiltrosAplicados] = useState({});

  const handleFiltrar = (filtros) => {
    setFiltrosAplicados(filtros);
    socket.emit("obterRelatorios", filtros);
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
        <p className="mt-2">Carregando relatórios...</p>
      </div>
    );
  }

  if (!dadosRelatorios || !dadosRelatorios.estatisticas) {
    return (
      <div className="alert alert-warning text-center">
        Nenhum dado encontrado com os filtros selecionados
      </div>
    );
  }

  // Filtra viagens por motorista se existir no filtro
  const viagensFiltradas = dadosRelatorios.viagens?.filter(viagem => {
    if (!filtrosAplicados.motorista) return true;
    return viagem.motorista?._id === filtrosAplicados.motorista;
  }) || [];

  // Calcula estatísticas filtradas
  const estatisticasFiltradas = {
    ...dadosRelatorios.estatisticas,
    totalViagens: viagensFiltradas.length,
    porMotorista: dadosRelatorios.estatisticas.porMotorista.filter(m => {
      if (!filtrosAplicados.motorista) return true;
      return m._id === filtrosAplicados.motorista;
    })
  };

  return (
    <div className="container mt-4">
      <div id="relatorio-container">
        <Header />
        
        <CardsDashboard estatisticas={estatisticasFiltradas} />
        
        <Filtros 
          onFiltrar={handleFiltrar} 
          filtrosAtivos={filtrosAplicados}
        />
        
        <ExportarRelatorios 
          dados={{ 
            viagens: viagensFiltradas, 
            estatisticas: estatisticasFiltradas 
          }} 
        />
        
        <Graficos 
          viagens={viagensFiltradas} 
          estatisticas={estatisticasFiltradas} 
        />
        
        <TabelaViagens 
          viagens={viagensFiltradas} 
          totalViagens={viagensFiltradas.length}
        />
      </div>
    </div>
  );
};

export default RelatorioComponent;