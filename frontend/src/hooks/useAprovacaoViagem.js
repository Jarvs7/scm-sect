// ✅ frontend/src/hooks/useAprovacaoViagem.js
import { useState } from 'react';
import api from '../utils/api';

export const useAprovacaoViagem = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const aprovarViagem = async (viagemId, dadosAprovacao) => {
    try {
      setLoading(true);
      await api.patch(`/viagens/${viagemId}/aprovar`, dadosAprovacao);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao aprovar viagem');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const rejeitarViagem = async (viagemId, motivo) => {
    try {
      setLoading(true);
      await api.patch(`/viagens/${viagemId}/rejeitar`, { motivo });
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao rejeitar viagem');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { aprovarViagem, rejeitarViagem, loading, error };
};
