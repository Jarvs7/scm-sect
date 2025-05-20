import React, { useState, useEffect } from "react";
import { useViagemForm } from "../../hooks/useViagemForm";
import socket from "../../utils/socket";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import "../../styles/SolicitarViagem/solicitarviagem.css";
import "../../styles/SolicitarViagem/model.css";

export default function SolicitacaoPage() {
  const {
    formData,
    setFormData,
    formErrors,
    setFormErrors,
    loading,
    submitSuccess,
    handleChange,
    handleBlur,
    handleSubmit,
    validateField,
  } = useViagemForm(socket);

  const [showUrgenteModal, setShowUrgenteModal] = useState(false);
  const [horaAtual, setHoraAtual] = useState("");

  const setores = [
    { sigla: "ACERVO", nome: "ACERVO" },
    { sigla: "ASCOM", nome: "ASSESSORIA DE COMUNICAÇÃO" },
    { sigla: "ASJUR", nome: "ASSESSORIA JURÍDICA" },
    { sigla: "ATENDIMENTO", nome: "ATENDIMENTO" },
    { sigla: "DEAD", nome: "DEPARTAMENTO ADMINISTRATIVO" },
    { sigla: "DEGEAF", nome: "GESTÃO AGRÁRIA E FUNDIÁRIA" },
    { sigla: "DEOF", nome: "DEPARTAMENTO DE FINANÇAS" },
    { sigla: "DGEPAD", nome: "GESTÃO DE PERÍCIA, AVALIAÇÃO E DESAPROPRIAÇÃO" },
    { sigla: "DGP", nome: "GESTÃO DE PESSOAS" },
    { sigla: "DP", nome: "DEFENSORIA PÚBLICA" },
    { sigla: "DPE", nome: "DEFENSORIA PÚBLICA DO ESTADO" },
    { sigla: "DPPE", nome: "PLANEJAMENTO E PROJETOS ESPECIAIS" },
    { sigla: "GABIN", nome: "GABINETE" },
    { sigla: "GC", nome: "GERÊNCIA DE CONTRATOS" },
    { sigla: "GEA", nome: "ARRECADAÇÃO" },
    { sigla: "GECAGEF", nome: "CARTOGRAFIA, GEOPROCESSAMENTO E FISCALIZAÇÃO" },
    { sigla: "GECOM", nome: "COMPRAS" },
    { sigla: "GECONT", nome: "GERÊNCIA CONTÁBIL" },
    { sigla: "GEVISC", nome: "VISTORIA E CADASTRO" },
    { sigla: "GGP", nome: "GESTÃO DE PESSOAL" },
    { sigla: "GOF", nome: "ORÇAMENTO E FINANÇAS" },
    { sigla: "GPA", nome: "PATRIMÔNIO E ALMOXARIFADO" },
    { sigla: "GPAE", nome: "PESQUISA, ANÁLISE E EXTENSÃO" },
    { sigla: "GTDF", nome: "TITULAÇÃO E DOCUMENTAÇÃO FUNDIÁRIA" },
    { sigla: "NUCBS", nome: "BEM-ESTAR DO SERVIDOR" },
    { sigla: "OUVIDORIA", nome: "OUVIDORIA" },
    { sigla: "PROTOCOLO", nome: "PROTOCOLO" },
    { sigla: "SE", nome: "SECRETARIA EXECUTIVA" },
    { sigla: "SEAF", nome: "ADMINISTRAÇÃO E FINANÇAS" },
    { sigla: "SEGETEC", nome: "GESTÃO TÉCNICA" },
    { sigla: "TI", nome: "TECNOLOGIA DA INFORMAÇÃO" },
    { sigla: "TRANSPORTE", nome: "TRANSPORTE" },
    { sigla: "UCI", nome: "UNIDADE DE CONTROLE INTERNO" },
  ];

  useEffect(() => {
    const agora = new Date();
    const horas = String(agora.getHours()).padStart(2, "0");
    const minutos = String(agora.getMinutes()).padStart(2, "0");
    setHoraAtual(`${horas}:${minutos}`);
  }, []);

  const getMinDate = (tipo) => {
    const hoje = new Date();
    if (tipo === "urgente") return hoje.toISOString().split("T")[0];
    const minimo24h = new Date(hoje.getTime() + 24 * 60 * 60 * 1000);
    return minimo24h.toISOString().split("T")[0];
  };

  const handleNormalSubmit = (e) => {
    e.preventDefault();
    const data = { ...formData, tipo: "normal" };
    const errors = {};

    if (!data["saida-data"] || !data["saida-hora"]) {
      errors["saida-data"] = "Data e hora são obrigatórias";
    } else {
      const saida = new Date(`${data["saida-data"]}T${data["saida-hora"]}`);
      const minimo24h = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
      if (saida < minimo24h) {
        errors["saida-data"] = "Necessário 24h de antecedência";
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors((prev) => ({ ...prev, ...errors }));
      return;
    }

    handleSubmit(e, data);
  };

  const confirmarUrgente = () => {
    const hoje = new Date().toISOString().split("T")[0];
    const dadosUrgente = {
      ...formData,
      tipo: "urgente",
      "saida-data": hoje,
      "saida-hora": horaAtual,
      observacoes:
        formData.observacoes || "Viagem urgente - justificativa necessária",
    };

    const errors = {
      "saida-data": validateField("saida-data", hoje, dadosUrgente),
      observacoes: validateField(
        "observacoes",
        dadosUrgente.observacoes,
        dadosUrgente
      ),
    };

    if (errors["saida-data"] || errors.observacoes) {
      setFormErrors((prev) => ({ ...prev, ...errors }));
      setShowUrgenteModal(false);
      return;
    }

    setFormData(dadosUrgente);
    setShowUrgenteModal(false);
    setTimeout(() => {
      handleSubmit(new Event("submit"), dadosUrgente);
    }, 100);
  };

  return (
    <div className="container solicitar-viagem-container">
      <h2 className="mb-4 text-center d-flex align-items-center justify-content-center">
        <i className="fas fa-map-marker-alt me-2"></i>
        Solicitar Viagem
      </h2>

      <form
        id="form-viagem"
        className="needs-validation"
        noValidate
        onSubmit={(e) => e.preventDefault()}
      >
        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="local" className="form-label">
              <i className="fas fa-map-marker-alt me-2"></i>Local de Destino*
            </label>
            <input
              type="text"
              name="local"
              className={`form-control ${formErrors.local ? "is-invalid" : ""}`}
              value={formData.local}
              onChange={handleChange}
              onBlur={handleBlur}
              required
            />
            {formErrors.local && (
              <div className="invalid-feedback">{formErrors.local}</div>
            )}
          </div>

          <div className="col-md-6 mb-3">
            <label htmlFor="passageiros" className="form-label">
              <i className="fas fa-users me-2"></i>Nº de Passageiros*
            </label>
            <input
              type="number"
              name="passageiros"
              min="1"
              max="4"
              className={`form-control ${
                formErrors.passageiros ? "is-invalid" : ""
              }`}
              value={formData.passageiros}
              onChange={handleChange}
              onBlur={handleBlur}
              required
            />
            {formErrors.passageiros && (
              <div className="invalid-feedback">{formErrors.passageiros}</div>
            )}
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="setor" className="form-label">
              <i className="fas fa-building me-2"></i>Setor Solicitante*
            </label>
            <select
              name="setor"
              className={`form-select ${formErrors.setor ? "is-invalid" : ""}`}
              value={formData.setor}
              onChange={handleChange}
              onBlur={handleBlur}
              required
            >
              <option value="">Selecione um setor</option>
              {setores.map((setor) => (
                <option key={setor.sigla} value={setor.sigla}>
                  {setor.sigla} - {setor.nome}
                </option>
              ))}
            </select>
            {formErrors.setor && (
              <div className="invalid-feedback">{formErrors.setor}</div>
            )}
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label">
              <i className="fas fa-clock me-2"></i>Data/Hora de Saída*
            </label>
            <div className="d-flex gap-2">
              <input
                type="date"
                name="saida-data"
                className={`form-control ${
                  formErrors["saida-data"] ? "is-invalid" : ""
                }`}
                min={getMinDate(formData.tipo)}
                value={formData["saida-data"]}
                onChange={handleChange}
                onBlur={handleBlur}
                required
              />
              <input
                type="time"
                name="saida-hora"
                className={`form-control ${
                  formErrors["saida-hora"] ? "is-invalid" : ""
                }`}
                value={formData["saida-hora"]}
                onChange={handleChange}
                onBlur={handleBlur}
                required
              />
            </div>
            {formErrors["saida-data"] && (
              <div className="invalid-feedback d-block">
                {formErrors["saida-data"]}
              </div>
            )}
          </div>
        </div>

        <div className="mb-3">
          <label htmlFor="observacoes" className="form-label">
            <i className="fas fa-sticky-note me-2"></i>
            Observações {formData.tipo === "urgente" && "*"}
          </label>
          <textarea
            name="observacoes"
            className={`form-control ${
              formErrors.observacoes ? "is-invalid" : ""
            }`}
            rows="3"
            value={formData.observacoes}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={
              formData.tipo === "urgente"
                ? "Justifique a necessidade urgente (mín. 10 caracteres)"
                : "Informações adicionais (opcional)"
            }
          />
          {formErrors.observacoes && (
            <div className="invalid-feedback">{formErrors.observacoes}</div>
          )}
        </div>

        <div className="d-flex justify-content-center gap-3 mt-4">
          <button
            type="button"
            className="btn btn-primary btn-lg"
            onClick={handleNormalSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin me-2"></i>
                Enviando...
              </>
            ) : (
              <>
                <i className="fas fa-paper-plane me-2"></i>
                Solicitar Normal
              </>
            )}
          </button>

          <button
            type="button"
            className="btn btn-danger btn-lg"
            onClick={() => setShowUrgenteModal(true)}
            disabled={loading}
          >
            <i className="fas fa-bolt me-2"></i>
            Solicitação Urgente
          </button>
        </div>

        {submitSuccess && (
          <div className="alert alert-success mt-3 text-center">
            <i className="fas fa-check-circle me-2"></i>
            Solicitação registrada com sucesso!
          </div>
        )}
      </form>

      <Modal
        show={showUrgenteModal}
        onHide={() => setShowUrgenteModal(false)}
        centered
        className="modal-urgente"
        contentClassName="modal-urgente-content"
        backdropClassName="modal-urgente-backdrop"
      >
        <Modal.Header className="modal-urgente-header" closeButton>
          <Modal.Title className="modal-urgente-title">
            <i className="fas fa-exclamation-triangle modal-urgente-icon me-2"></i>
            Confirmação de Viagem Urgente
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-urgente-body">
          <p className="modal-urgente-text">
            Você está solicitando uma viagem{" "}
            <strong className="modal-urgente-alert">URGENTE</strong> para:
          </p>
          <ul className="modal-urgente-list">
            <li className="modal-urgente-item">
              Data: <strong>{new Date().toLocaleDateString()}</strong>
            </li>
            <li className="modal-urgente-item">
              Hora: <strong>{horaAtual}</strong>
            </li>
          </ul>
          <p className="modal-urgente-warning">
            <i className="fas fa-exclamation-circle modal-urgente-icon me-2"></i>
            Justifique a necessidade no campo de observações
          </p>
        </Modal.Body>
        <Modal.Footer className="modal-urgente-footer">
          <Button
            className="modal-urgente-btn modal-urgente-btn-cancel"
            onClick={() => setShowUrgenteModal(false)}
          >
            Cancelar
          </Button>
          <Button
            className="modal-urgente-btn modal-urgente-btn-confirm"
            onClick={confirmarUrgente}
          >
            Confirmar Urgência
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
