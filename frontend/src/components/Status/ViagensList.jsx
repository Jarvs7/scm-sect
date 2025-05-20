import React from 'react';
import PropTypes from 'prop-types';
import '../../styles/Status/status.css';

const ViagensList = ({ viagensAtivas, finalizarViagem, loading }) => {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const viagensFuturas = viagensAtivas.filter(viagem => {
    const dataViagem = new Date(viagem.saida);
    dataViagem.setHours(0, 0, 0, 0);
    return dataViagem > hoje && viagem.status !== 'finalizada';
  });

  return (
    <div className="col-md-12">
      <div className="card mb-4 shadow-sm">
        <div className="card-header text-center">
          <h5 className="mb-0">
            <i className="fas fa-calendar-alt me-2"></i>
            Viagens Futuras
          </h5>
        </div>
        <div className="card-body p-0">
          <div className="list-group list-group-flush">
            {viagensFuturas.length === 0 ? (
              <div className="text-center text-muted p-3">
                <i className="fas fa-info-circle me-2"></i>
                Nenhuma viagem futura agendada
              </div>
            ) : (
              viagensFuturas.map((viagem) => (
                <div
                  key={viagem._id}
                  className={`viagem-card list-group-item ${viagem.urgente ? 'urgente' : ''}`}
                >
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <h5 className="mb-2">
                        <i className="fas fa-map-marker-alt me-2"></i>
                        {viagem.local}
                        {viagem.urgente && (
                          <span className="badge-urgente ms-2">URGENTE</span>
                        )}
                      </h5>
                      
                      <div className="d-flex flex-wrap gap-3 mb-2">
                        <div>
                          <i className="fas fa-user me-2 text-muted"></i>
                          <small>{viagem.motorista?.nome || "N/A"}</small>
                        </div>
                        <div>
                          <i className="fas fa-car me-2 text-muted"></i>
                          <small>{viagem.veiculo?.placa || "N/A"}</small>
                        </div>
                      </div>
                      
                      <div>
                        <i className="fas fa-clock me-2 text-muted"></i>
                        <small>{new Date(viagem.saida).toLocaleString('pt-BR')}</small>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

ViagensList.propTypes = {
  viagensAtivas: PropTypes.array.isRequired,
  finalizarViagem: PropTypes.func,     // ✅ Apenas declarado para evitar erro
  loading: PropTypes.bool              // ✅ Apenas declarado para evitar erro
};

export default ViagensList;
