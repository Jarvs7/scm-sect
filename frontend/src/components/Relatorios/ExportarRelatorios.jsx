import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { utils, writeFile } from 'xlsx';
import axios from 'axios';

// Configuração do axios com autenticação
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://192.168.0.92:1120/api',
  timeout: 10000
});

// Interceptor para adicionar o token às requisições
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

const ExportarRelatorios = () => {
  const [dadosRelatorios, setDadosRelatorios] = useState({ viagens: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Busca os dados do banco de dados
  useEffect(() => {
    const fetchDados = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.get('/viagens');
        
        setDadosRelatorios({ 
          viagens: Array.isArray(response?.data) ? response.data : [] 
        });
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        
        if (error.response?.status === 401) {
          // Token inválido ou expirado
          setError('Sessão expirada. Por favor, faça login novamente.');
          // Opcional: redirecionar para login
          // window.location.href = '/login';
        } else {
          setError(error.response?.data?.message || 'Erro ao carregar dados');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDados();
  }, []);

  // Funções de exportação (PDF e Excel) permanecem iguais
  const exportarPDF = () => {
    // ... (código anterior)
  };

  const exportarExcel = () => {
    // ... (código anterior)
  };

  return (
    <div className="mb-3">
      {loading && (
        <div className="alert alert-info d-flex align-items-center">
          <div className="spinner-border spinner-border-sm me-2" role="status" />
          Carregando dados...
        </div>
      )}
      
      {error && (
        <div className="alert alert-danger d-flex align-items-center">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      <div className="d-flex gap-2">
        <button 
          onClick={exportarPDF} 
          className="btn btn-danger"
          disabled={loading || dadosRelatorios.viagens.length === 0}
        >
          <i className="fas fa-file-pdf me-2"></i>
          Exportar PDF
        </button>
        
        <button 
          onClick={exportarExcel} 
          className="btn btn-success"
          disabled={loading || dadosRelatorios.viagens.length === 0}
        >
          <i className="fas fa-file-excel me-2"></i>
          Exportar Excel
        </button>
      </div>
    </div>
  );
};

export default ExportarRelatorios;