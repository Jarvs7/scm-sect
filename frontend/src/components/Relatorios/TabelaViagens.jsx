import React from "react";
import "../../styles/Relatorio/relatorio.css";

const TabelaViagens = ({ viagens, totalViagens }) => {
  return (
    <div className="card mt-4">
      <div className="card-header custom-card-header2 text-white d-flex justify-content-between">
        <h5 className="mb-0">Detalhamento de Viagens</h5>
      </div>
      <div className="card-body">
        {viagens.length === 0 ? (
          <div className="alert alert-info">
            Nenhuma viagem encontrada com os filtros selecionados
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead className="table-dark">
                <tr>
                  <th>Data/Hora</th>
                  <th>Motorista</th>
                  <th>Veículo</th>
                  <th>Destino</th>
                  <th>Passageiros</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {viagens.map((viagem) => (
                  <tr key={viagem._id}>
                    <td>{new Date(viagem.saida).toLocaleString("pt-BR")}</td>
                    <td>
                      {viagem.motorista?.nome || "N/A"}
                      <br />
                      <small className="text-muted">
                        {viagem.motorista?.cnh
                          ? `CNH: ${viagem.motorista.cnh}`
                          : ""}
                      </small>
                    </td>
                    <td>
                      {viagem.veiculo?.nome || "N/A"}
                      <br />
                      <small className="text-muted">
                        {viagem.veiculo?.placa || ""}
                      </small>
                    </td>
                    <td>{viagem.local}</td>
                    <td>{viagem.passageiros}</td>
                    <td>
                      <span
                        className={`badge ${
                          viagem.status === "finalizada"
                            ? "bg-success"
                            : viagem.status === "cancelada"
                            ? "bg-danger"
                            : "bg-primary"
                        }`}
                      >
                        {viagem.status === "finalizada"
                          ? "Finalizada"
                          : viagem.status === "cancelada"
                          ? "Cancelada"
                          : "Em andamento"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TabelaViagens;
