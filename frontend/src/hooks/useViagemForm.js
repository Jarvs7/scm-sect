import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://192.168.0.92:1120/api",
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const useViagemForm = (socket) => {
  const [formData, setFormData] = useState({
    motorista: "",
    veiculo: "",
    local: "",
    passageiros: "",
    setor: "",
    "saida-data": new Date().toISOString().split("T")[0],
    "saida-hora": "",
    observacoes: "",
    tipo: "",
  });

  const [motoristas, setMotoristas] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [viagensPendentes, setViagensPendentes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Carrega dados iniciais
  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true);
        const [motoristasRes, veiculosRes, viagensRes] = await Promise.all([
          api.get("/motoristas/disponiveis"),
          api.get("/veiculos/disponiveis"),
          api.get("/viagens/pendentes"),
        ]);
        setMotoristas(motoristasRes.data);
        setVeiculos(veiculosRes.data);
        setViagensPendentes(viagensRes.data);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };
    carregarDados();

    // Configura listeners do socket
    const listeners = {
      atualizarMotoristas: (data) => setMotoristas(data),
      atualizarVeiculos: (data) => setVeiculos(data),
      novaSolicitacaoViagem: (data) =>
        setViagensPendentes((prev) => [...prev, data]),
    };

    Object.entries(listeners).forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    return () => {
      Object.keys(listeners).forEach((event) => socket.off(event));
    };
  }, [socket]);

  // Validação de campos
  const validateField = useCallback((name, value, currentFormData) => {
    switch (name) {
      case "local":
      case "setor":
        return !value?.trim() ? "Campo obrigatório" : "";

      case "passageiros":
        if (!value) return "Informe o número";
        if (isNaN(value)) return "Deve ser um número";
        if (value < 1 || value > 4) return "Entre 1 e 4";
        return "";

      case "saida-data":
        if (!value) return "Informe a data";
        if (currentFormData.tipo === "urgente") {
          const hoje = new Date().toISOString().split("T")[0];
          if (value !== hoje) return "Urgente deve ser hoje";
        }
        return "";

      case "saida-hora":
        if (!value) return "Informe o horário";
        return "";

      case "observacoes":
        if (currentFormData.tipo === "urgente" && !value?.trim()) {
          return "Justifique a urgência (mín. 10 caracteres)";
        }
        return "";

      default:
        return "";
    }
  }, []);

  // Manipuladores de eventos
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setFormErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value, formData),
    }));
  };

  // Submissão do formulário
  const handleSubmit = async (e, overrideData) => {
    e.preventDefault();
    setLoading(true);
    setSubmitSuccess(false);

    const submissionData = overrideData || formData;
    const errors = {};

    // 🔍 Validação completa dos campos
    Object.keys(submissionData).forEach((key) => {
      if (!["motorista", "veiculo"].includes(key)) {
        const error = validateField(key, submissionData[key], submissionData);
        if (error) errors[key] = error;
      }
    });

    // ❌ Se houver erros, atualiza e cancela envio
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setLoading(false);
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem("user") || {});
      const saida = new Date(
        `${submissionData["saida-data"]}T${submissionData["saida-hora"]}`
      );

      // 📦 Monta o objeto da viagem
      const viagemData = {
        ...submissionData,
        saida,
        solicitadoPor: user._id,
        status: "pendente",
      };

      // ✅ REMOVE campos se estiverem vazios para evitar erro de cast do Mongo
      if (!viagemData.motorista) delete viagemData.motorista;
      if (!viagemData.veiculo) delete viagemData.veiculo;

      // 📡 Envia para o backend
      const response = await api.post("/viagens", viagemData);

      if (response.data.success) {
        setSubmitSuccess(true);
        setFormData({
          motorista: "",
          veiculo: "",
          local: "",
          passageiros: "",
          setor: "",
          "saida-data": new Date().toISOString().split("T")[0],
          "saida-hora": "",
          observacoes: "",
          tipo: "",
        });

        // 🔔 Notifica via socket que há uma nova solicitação
        socket.emit("novaSolicitacaoViagem", response.data.viagem);
      }
    } catch (error) {
      console.error("Erro ao solicitar viagem:", error);
      alert(error.response?.data?.message || "Erro ao enviar solicitação");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Exporta o hook com os dados e métodos
  return {
    formData,
    setFormData,
    formErrors,
    setFormErrors, 
    loading,
    submitSuccess,
    motoristas,
    veiculos,
    viagensPendentes,
    handleChange,
    handleBlur,
    handleSubmit,
    validateField,
  };
  
};
