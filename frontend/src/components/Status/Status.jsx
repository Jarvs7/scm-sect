// ✅ frontend/src/components/Status/Status.jsx
import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import StatusCards from "./StatusCards";
import ViagensList from "./ViagensList";
import ViagensHoje from "./ViagensHoje";
import MotoristasList from "./MotoristasList";

import useViagemData from "../../hooks/useViagemData";
import { Link } from "react-router-dom";

const Status = () => {
  const { dados, finalizarViagem, loading, loadData } = useViagemData(); // ⬅ loadData incluído
  const [viagensAtivas, setViagensAtivas] = useState([]);

  useEffect(() => {
    if (Array.isArray(dados.viagens)) {
      const ativas = dados.viagens.filter((v) => v.status === "em_andamento");
      setViagensAtivas(ativas);
    }
  }, [dados.viagens]);

  const motoristasAtualizados = Array.isArray(dados.motoristas)
    ? dados.motoristas.map((motorista) => {
        const emViagem =
          motorista.status === "em_viagem" ||
          viagensAtivas.some((v) => v.motorista?._id === motorista._id);
        return { ...motorista, emViagem };
      })
    : [];

  const disponibilidade = {
    motoristasDisponiveis: (dados.motoristas || []).filter(
      (m) => m.status === "disponivel"
    ).length,
    veiculosDisponiveis: (dados.veiculos || []).filter(
      (v) => v.status === "disponivel"
    ).length,
    totalMotoristas: dados.motoristas?.length || 0,
    totalVeiculos: dados.veiculos?.length || 0,
  };

  return (
    <div className="container mt-4">
      {/* Cards de status no topo */}
      <div className="row">
        <div className="col-md-12 mb-4">
          <StatusCards
            estatisticas={dados.estatisticas || {}}
            disponibilidade={disponibilidade}
          />
        </div>
      </div>

      {/* Layout principal em duas colunas */}
      <div className="row">
        {/* Coluna esquerda - Viagens */}
        <div className="col-lg-8 mb-4">
          <div className="card h-100 shadow-sm">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <i className="fas fa-route me-2"></i>
                Gerenciamento de Viagens
              </h5>
            </div>
            <div className="card-body">
              <div className="mb-4">
                <h6 className="border-bottom pb-2">
                  <i className="fas fa-calendar-day me-2"></i>
                  Viagens de Hoje
                </h6>
                <ViagensHoje
                  viagensAtivas={viagensAtivas}
                  setViagensAtivas={setViagensAtivas}
                  finalizarViagem={finalizarViagem}
                  loading={loading}
                  loadData={loadData} // ✅ adicionado!
                />
              </div>

              <div>
                <h6 className="border-bottom pb-2">
                  <i className="fas fa-list me-2"></i>
                  Todas as Viagens Ativas
                </h6>
                <ViagensList
                  viagensAtivas={viagensAtivas}
                  finalizarViagem={finalizarViagem}
                  loading={loading}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Coluna direita - Motoristas */}
        <div className="col-lg-4 mb-4">
          <div className="card h-100 shadow-sm">
            <div className="card-header bg-warning text-dark">
              <h5 className="mb-0">
                <i className="fas fa-users me-2"></i>
                Status dos Motoristas
              </h5>
            </div>
            <div className="card-body">
              <MotoristasList
                motoristas={motoristasAtualizados}
                viagensAtivas={viagensAtivas}
                totalMotoristas={disponibilidade.totalMotoristas}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Botão de voltar */}
      <div className="row justify-content-center mt-4">
        <div className="col-auto">
          <Link
            to="/registro-viagem"
            className="btn btn-outline-secondary btn-voltar-centralizado"
          >
            <i className="fas fa-arrow-left me-2"></i>
            Voltar para Registro
          </Link>
        </div>
      </div>

      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
};

export default Status;
