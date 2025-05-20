// ✅ frontend/src/components/Status/ViagensHoje.jsx
import React from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import "../../styles/Status/status.css";

const ViagensHoje = ({
  viagensAtivas,
  setViagensAtivas,
  loading,
  finalizarViagem,
  loadData = () => {}, // fallback para evitar erros
}) => {
  const hoje = new Date();

  const viagensHoje = viagensAtivas.filter((viagem) => {
    const dataSaida = new Date(viagem.saida);
    return (
      dataSaida.getDate() === hoje.getDate() &&
      dataSaida.getMonth() === hoje.getMonth() &&
      dataSaida.getFullYear() === hoje.getFullYear() &&
      viagem.status === "em_andamento"
    );
  });

  const handleFinalizarViagem = async (id) => {
    const confirm = window.confirm(
      "Tem certeza que deseja finalizar esta viagem?"
    );
    if (!confirm) return;

    try {
      await finalizarViagem(id);

      // Remove localmente para resposta rápida
      setViagensAtivas((prev) => prev.filter((viagem) => viagem._id !== id));

      toast.success("Viagem finalizada com sucesso!");

      await loadData(); // atualiza tudo
    } catch (error) {
      console.error("Erro ao finalizar a viagem:", error);
      toast.error("Erro ao finalizar a viagem.");
    }
  };

  return (
    <div className="col-md-12">
      <div className="card mb-4 shadow-sm">
        <div className="card-header text-center">
          <h5 className="mb-0">
            <i className="fas fa-car me-2"></i>
            Viagens de Hoje
          </h5>
        </div>
        <div className="card-body p-0">
          <div className="list-group list-group-flush">
            {viagensHoje.length === 0 ? (
              <div className="text-center text-muted p-3">
                <i className="fas fa-info-circle me-2"></i>
                Nenhuma viagem para hoje
              </div>
            ) : (
              viagensHoje.map((viagem) => (
                <div
                  key={viagem._id}
                  className={`viagem-card em_andamento list-group-item ${
                    viagem.tipo === "urgente" ? "urgente" : ""
                  }`}
                >
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <div className="flex-grow-1">
                      <h5 className="mb-2">
                        <i className="fas fa-map-marker-alt me-2"></i>
                        {viagem.local}
                        {viagem.tipo === "urgente" && (
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
                        <div>
                          <i className="fas fa-users me-2 text-muted"></i>
                          <small>{viagem.passageiros || 0} passageiros</small>
                        </div>
                      </div>

                      <div className="mb-2">
                        <i className="fas fa-clock me-2 text-muted"></i>
                        <small>{new Date(viagem.saida).toLocaleString()}</small>
                      </div>

                      {viagem.observacoes && (
                        <div className="mb-2">
                          <i className="fas fa-sticky-note me-2 text-muted"></i>
                          <small className="text-muted">
                            <strong>Observações:</strong> {viagem.observacoes}
                          </small>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleFinalizarViagem(viagem._id)}
                      className="btn-finalizar-viagem"
                      disabled={loading}
                    >
                      {loading ? (
                        <i className="fas fa-spinner fa-spin me-2"></i>
                      ) : (
                        <i className="fas fa-check me-2"></i>
                      )}
                      Finalizar
                    </button>
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

ViagensHoje.propTypes = {
  viagensAtivas: PropTypes.array.isRequired,
  setViagensAtivas: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  finalizarViagem: PropTypes.func.isRequired,
  loadData: PropTypes.func, // agora não é mais required
};

export default ViagensHoje;
