import React from "react";
import "../../styles/Status/status.css";

const StatusCards = ({ estatisticas, disponibilidade }) => {
  return (
    <div className="row mb-4">
      <div className="col-md-4 mb-3">
        <div className="card text-white h-100">
          <div className="card-body text-center">
            <h5 className="card-title">
              <i className="fas fa-car me-2"></i>
              Viagens em Andamento
            </h5>
            <p className="card-text display-4">
              {estatisticas.viagensEmAndamento}
            </p>
          </div>
        </div>
      </div>

      <div className="col-md-4 mb-3">
        <div className="card text-white h-100">
          <div className="card-body text-center">
            <h5 className="card-title">
              <i className="fas fa-check-circle me-2"></i>
              Viagens Finalizadas
            </h5>
            <p className="card-text display-4">
              {estatisticas.viagensFinalizadas}
            </p>
          </div>
        </div>
      </div>

      <div className="col-md-4 mb-3">
        <div className="card text-white h-100">
          <div className="card-body text-center">
            <h5 className="card-title">
              <i className="fas fa-list-ol me-2"></i>
              Total de Viagens
            </h5>
            <p className="card-text display-4">{estatisticas.totalViagens}</p>
          </div>
        </div>
      </div>

      <div className="col-md-6 mb-3">
        <div className="card text-white custom-card-header1 h-100">
          <div className="card-body text-center">
            <h5 className="card-title">
              <i className="fas fa-user me-2"></i>
              Motoristas Disponíveis
            </h5>
            <p className="card-text display-4">
              {disponibilidade.motoristasDisponiveis}
            </p>
          </div>
        </div>
      </div>

      <div className="col-md-6 mb-3">
        <div className="card text-white custom-card-header1 h-100">
          <div className="card-body text-center">
            <h5 className="card-title">
              <i className="fas fa-truck me-2"></i>
              Veículos Disponíveis
            </h5>
            <p className="card-text display-4">
              {disponibilidade.veiculosDisponiveis}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusCards;
