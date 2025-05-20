import React, { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import api from "../../utils/api";

const API_URL = process.env.REACT_APP_API_URL || "http://192.168.0.92:1120";

interface Motorista {
  _id: string;
  nome: string;
  cnh: string;
  status: string;
}

interface FiltrosState {
  dataInicial: string;
  dataFinal: string;
  motorista: string;
  status: string;
}

interface FiltrosProps {
  onFiltrar: (filtros: Partial<FiltrosState>) => void;
  filtrosAtivos?: Partial<FiltrosState>;
  loading?: boolean;
}

const Filtros: React.FC<FiltrosProps> = ({
  onFiltrar,
  filtrosAtivos,
  loading: parentLoading,
}) => {
  const [motoristas, setMotoristas] = useState<Motorista[]>([]);
  const [localLoading, setLocalLoading] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosState>({
    dataInicial: filtrosAtivos?.dataInicial || "",
    dataFinal: filtrosAtivos?.dataFinal || "",
    motorista: filtrosAtivos?.motorista || "todos",
    status: filtrosAtivos?.status || "todos",
  });

  const loading = parentLoading || localLoading;

  useEffect(() => {
    let isMounted = true;

    const carregarMotoristas = async () => {
      try {
        setLocalLoading(true);

        const response = await api.get("/viagens/motoristas");

        if (response.status !== 200) {
          throw new Error("Erro ao carregar motoristas");
        }

        const result = response.data;

        // Se a resposta já for um array
        const dados = Array.isArray(result) ? result : result.data || [];

        if (!Array.isArray(dados)) {
          throw new Error("Resposta inválida da API de motoristas");
        }

        if (isMounted) {
          setMotoristas(dados.filter((m: Motorista) => m.status !== "inativo"));
        }
      } catch (error) {
        console.error("Erro ao carregar motoristas:", error);
      } finally {
        if (isMounted) setLocalLoading(false);
      }
    };

    carregarMotoristas();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleFiltrar = () => {
    const filtrosParaEnviar: Partial<FiltrosState> = { ...filtros };

    if (filtrosParaEnviar.dataInicial || filtrosParaEnviar.dataFinal) {
      if (!filtrosParaEnviar.dataInicial || !filtrosParaEnviar.dataFinal) {
        alert("Por favor, preencha ambas as datas para filtrar por período.");
        return;
      }

      const dataInicial = new Date(filtrosParaEnviar.dataInicial);
      const dataFinal = new Date(filtrosParaEnviar.dataFinal);

      if (dataInicial > dataFinal) {
        alert("A data inicial não pode ser maior que a data final.");
        return;
      }

      filtrosParaEnviar.dataInicial = dataInicial.toISOString().split("T")[0];
      filtrosParaEnviar.dataFinal = dataFinal.toISOString().split("T")[0];
    }

    if (filtrosParaEnviar.motorista === "todos")
      delete filtrosParaEnviar.motorista;
    if (filtrosParaEnviar.status === "todos") delete filtrosParaEnviar.status;
    if (!filtrosParaEnviar.dataInicial) delete filtrosParaEnviar.dataInicial;
    if (!filtrosParaEnviar.dataFinal) delete filtrosParaEnviar.dataFinal;

    onFiltrar(filtrosParaEnviar);
  };

  const limparFiltros = () => {
    setFiltros({
      dataInicial: "",
      dataFinal: "",
      motorista: "todos",
      status: "todos",
    });
    onFiltrar({});
  };

  const motoristasFiltrados = useMemo(() => {
    return motoristas.map((motorista) => (
      <option key={motorista._id} value={motorista._id}>
        {motorista.nome} (
        {motorista.status === "em_viagem" ? "Em viagem" : "Disponível"})
      </option>
    ));
  }, [motoristas]);

  return (
    <div className="card mb-4">
      <div className="card-header custom-card-header2 text-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Filtros</h5>
        <button
          onClick={limparFiltros}
          className="btn btn-sm btn-outline-light"
          disabled={loading}
        >
          Limpar
        </button>
      </div>
      <div className="card-body">
        <div className="row g-3">
          <div className="col-md-3">
            <label htmlFor="dataInicial" className="form-label">
              Data Inicial
            </label>
            <input
              id="dataInicial"
              type="date"
              className="form-control text-black"
              value={filtros.dataInicial}
              onChange={(e) =>
                setFiltros({ ...filtros, dataInicial: e.target.value })
              }
              max={filtros.dataFinal || undefined}
            />
          </div>

          <div className="col-md-3">
            <label htmlFor="dataFinal" className="form-label">
              Data Final
            </label>
            <input
              id="dataFinal"
              type="date"
              className="form-control text-black"
              value={filtros.dataFinal}
              onChange={(e) =>
                setFiltros({ ...filtros, dataFinal: e.target.value })
              }
              min={filtros.dataInicial || undefined}
            />
          </div>

          <div className="col-md-3">
            <label htmlFor="motorista" className="form-label">
              Motoristas
            </label>
            <select
              id="motorista"
              className="form-select text-black"
              value={filtros.motorista}
              onChange={(e) =>
                setFiltros({ ...filtros, motorista: e.target.value })
              }
              disabled={loading}
            >
              <option value="todos">Todos os motoristas</option>
              {motoristasFiltrados}
            </select>
          </div>

          <div className="col-md-3">
            <label htmlFor="status" className="form-label">
              Status
            </label>
            <select
              id="status"
              className="form-select text-black"
              value={filtros.status}
              onChange={(e) =>
                setFiltros({ ...filtros, status: e.target.value })
              }
              disabled={loading}
            >
              <option value="todos">Todos status</option>
              <option value="em_andamento">Em andamento</option>
              <option value="finalizada">Finalizada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>

          <div className="col-md-3 d-flex align-items-end">
            <button
              onClick={handleFiltrar}
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Filtrando...
                </>
              ) : (
                <>
                  <i className="fas fa-filter me-2"></i>Filtrar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Filtros;
