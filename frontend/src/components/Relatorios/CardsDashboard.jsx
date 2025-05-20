import React from "react";

const CardsDashboard = ({ estatisticas }) => {
  return (
    <div className="row mb-4">
      <div className="col-md-4">
        <div className="card text-white custom-card-header h-100 w-100">
          <div className="card-body">
            <h5 className="card-title">Total de Viagens</h5>
            <h2>{estatisticas?.totalViagens || 0}</h2>
          </div>
        </div>
      </div>
      <div className="col-md-4">
        <div className="card text-white custom-card-header h-100 w-100">
          <div className="card-body">
            <h5 className="card-title">Viagens Finalizadas</h5>
            <h2>{estatisticas?.viagensFinalizadas || 0}</h2>
          </div>
        </div>
      </div>
      <div className="col-md-4">
        <div className="card text-white custom-card-header h-100 w-100">
          <div className="card-body">
            <h5 className="card-title">Viagens em Andamento</h5>
            <h2>{estatisticas?.viagensEmAndamento || 0}</h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardsDashboard;
