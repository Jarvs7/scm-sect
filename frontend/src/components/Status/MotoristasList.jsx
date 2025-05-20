import React from 'react';
import PropTypes from 'prop-types';
import '../../styles/Status/status.css';

const MotoristasList = ({
  motoristas = [],
  viagensAtivas = [],
  totalMotoristas = 0,
}) => {
  const estaEmViagem = (motorista) => {
    if (!motorista || typeof motorista !== 'object' || !motorista._id) {
      return false;
    }

    const status = motorista.status || 'disponivel';

    if (status === "em_viagem") {
      return true;
    }

    if (Array.isArray(viagensAtivas)) {
      return viagensAtivas.some((v) => v?.motorista?._id === motorista._id);
    }

    return false;
  };

  const motoristasValidos = Array.isArray(motoristas)
    ? motoristas.filter((m) => m && typeof m === 'object' && m._id)
    : [];

  return (
    <div className="col-mb-6">
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-black text-white text-center">
          <h5 className="mb-0">
            <i className="fas fa-users me-2"></i>
            Motoristas ({motoristasValidos.filter(m => !estaEmViagem(m)).length}/{motoristasValidos.length} disponíveis)
          </h5>
        </div>
        <div className="card-body p-0">
          <div className="list-group list-group-flush">
            {motoristasValidos.length === 0 ? (
              <div className="text-center text-muted p-3">
                <i className="fas fa-info-circle me-2"></i>
                Nenhum motorista cadastrado
              </div>
            ) : (
              motoristasValidos.map((motorista) => {
                const motoristaSeguro = {
                  _id: motorista._id || '',
                  nome: motorista.nome || 'Nome não disponível',
                  cnh: motorista.cnh || 'CNH não informada',
                  status: motorista.status || 'disponivel',
                };

                const emViagem = estaEmViagem(motoristaSeguro);

                return (
                  <div
                    key={motoristaSeguro._id}
                    className={`list-group-item ${emViagem ? 'list-group-item-warning' : ''}`}
                  >
                    <div className="d-flex w-100 justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-1 text-dark">{motoristaSeguro.nome}</h6>
                        <small className="text-muted">CNH: {motoristaSeguro.cnh}</small>
                      </div>
                      <span className={`badge ${emViagem ? 'bg-warning' : 'bg-success'}`}>
                        {emViagem ? 'Em viagem' : 'Disponível'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

MotoristasList.propTypes = {
  motoristas: PropTypes.array,
  viagensAtivas: PropTypes.array,
  totalMotoristas: PropTypes.number,
};

export default MotoristasList;
