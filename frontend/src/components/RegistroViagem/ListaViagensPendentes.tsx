import React, { useEffect, useState } from "react";
import api from "../../utils/api";

interface Viagem {
  _id: string;
  local: string;
  passageiros: number;
  setor: string;
  observacoes?: string;
  saida: string;
  tipo?: "normal" | "urgente";
}

interface Motorista {
  _id: string;
  nome: string;
}

interface Veiculo {
  _id: string;
  nome: string;
  placa: string;
}

const ListaViagensPendentes = () => {
  const [viagensPendentes, setViagensPendentes] = useState<Viagem[]>([]);
  const [motoristas, setMotoristas] = useState<Motorista[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [selecoes, setSelecoes] = useState<{
    [viagemId: string]: { motorista: string; veiculo: string };
  }>({});

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user.role === "admin";

  const podeAprovar = (viagem: Viagem) => {
    const horas = (new Date(viagem.saida).getTime() - Date.now()) / 36e5;
    return (
      viagem.tipo === "urgente" ||
      horas >= 24 ||
      (viagem.tipo === "normal" && horas < 24 && isAdmin)
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [viagensRes, motoristasRes, veiculosRes] = await Promise.all([
          api.get("/viagens/pendentes"),
          api.get("/motoristas/disponiveis"),
          api.get("/veiculos/disponiveis"),
        ]);

        setViagensPendentes(viagensRes.data);
        setMotoristas(motoristasRes.data);
        setVeiculos(veiculosRes.data);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        alert("Erro ao carregar dados de viagens, motoristas ou veículos");
      }
    };

    fetchData();
  }, []);

  const handleReprovar = async (id: string) => {
    const motivo = prompt("Informe o motivo da reprovação:");
    if (!motivo || motivo.trim().length < 5) {
      alert("Motivo muito curto. Mínimo 5 caracteres.");
      return;
    }

    try {
      const response = await api.patch(`/viagens/${id}/rejeitar`, { motivo });
      if (response.data.success) {
        alert("Viagem reprovada com sucesso!");
        setViagensPendentes((prev) => prev.filter((v) => v._id !== id));
      } else {
        alert(response.data.message || "Erro ao reprovar viagem.");
      }
    } catch (err) {
      console.error("Erro ao reprovar viagem:", err);
      alert("Erro ao reprovar viagem.");
    }
  };

  const handleAprovar = async (viagemId: string) => {
    const selecaoAtual = selecoes[viagemId];
    if (!selecaoAtual?.motorista || !selecaoAtual?.veiculo) {
      alert("Selecione um motorista e um veículo para essa viagem");
      return;
    }

    try {
      const response = await api.patch(`/viagens/${viagemId}/aprovar`, {
        motorista: selecaoAtual.motorista,
        veiculo: selecaoAtual.veiculo,
        aprovador: user._id,
      });

      if (response.data.success) {
        alert("Viagem aprovada com sucesso!");

        setViagensPendentes((prev) => prev.filter((v) => v._id !== viagemId));
        setMotoristas((prev) =>
          prev.filter((m) => m._id !== selecaoAtual.motorista)
        );
        setVeiculos((prev) =>
          prev.filter((v) => v._id !== selecaoAtual.veiculo)
        );
        setSelecoes((prev) => {
          const atual = { ...prev };
          delete atual[viagemId];
          return atual;
        });
      } else {
        alert(response.data.message || "Erro ao aprovar viagem");
      }
    } catch (err) {
      console.error("Erro ao aprovar viagem:", err);
      alert("Erro ao aprovar viagem");
    }
  };

  return (
    <div className="container">
      <h2 className="mb-4 text-center d-flex align-items-center justify-content-center">
        <i className="fas fas fa-calendar-alt me-2"></i>
        Viagens Pendentes
      </h2>
      {viagensPendentes.length === 0 ? (
        <p>Nenhuma Solicitação Pendente no Momento.</p>
      ) : (
        viagensPendentes.map((viagem) => {
          const selecao = selecoes[viagem._id] || {
            motorista: "",
            veiculo: "",
          };

          const pode = podeAprovar(viagem);

          return (
            <div
              key={viagem._id}
              className={`viagem-card ${
                viagem.tipo === "urgente" ? "urgente" : ""
              }`}
            >
              <div className="viagem-content">
                <div className="viagem-info">
                  <h5>
                    Destino: {viagem.local}
                    {viagem.tipo === "urgente" && (
                      <span className="badge-urgente fas fa-exclamation-triangle">
                        {" "}
                        URGENTE
                      </span>
                    )}
                  </h5>
                  <p>
                    <strong>Setor:</strong> {viagem.setor}
                  </p>
                  <p>
                    <strong>Passageiros:</strong> {viagem.passageiros}
                  </p>
                  <p>
                    <strong>Data/Hora:</strong>{" "}
                    {new Date(viagem.saida).toLocaleString()}
                  </p>
                  <p>
                    <strong>Observações:</strong> {viagem.observacoes || "-"}
                  </p>
                </div>

                <div className="selecao-container">
                  <div className="select-group">
                    <label>Motorista:</label>
                    <select
                      value={selecao.motorista}
                      onChange={(e) =>
                        setSelecoes((prev) => ({
                          ...prev,
                          [viagem._id]: {
                            ...prev[viagem._id],
                            motorista: e.target.value,
                          },
                        }))
                      }
                    >
                      <option value="">Selecione...</option>
                      {motoristas.map((m) => (
                        <option key={m._id} value={m._id}>
                          {m.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="select-group">
                    <label>Veículo:</label>
                    <select
                      value={selecao.veiculo}
                      onChange={(e) =>
                        setSelecoes((prev) => ({
                          ...prev,
                          [viagem._id]: {
                            ...prev[viagem._id],
                            veiculo: e.target.value,
                          },
                        }))
                      }
                    >
                      <option value="">Selecione...</option>
                      {veiculos.map((v) => (
                        <option key={v._id} value={v._id}>
                          {v.nome} - {v.placa}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="viagem-actions">
                <button
                  className="btn-aprovar"
                  onClick={() => handleAprovar(viagem._id)}
                  disabled={!selecao.motorista || !selecao.veiculo || !pode}
                >
                  Aprovar
                </button>
                <button
                  className="btn-reprovar"
                  onClick={() => handleReprovar(viagem._id)}
                >
                  Reprovar
                </button>
                {viagem.tipo === "normal" && !pode && (
                  <p style={{ color: "red", marginTop: "0.5rem" }}>
                    Apenas administradores podem aprovar viagens normais com
                    menos de 24h
                  </p>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default ListaViagensPendentes;
