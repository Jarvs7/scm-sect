// src/utils/relatorioUtils.js
export const processarDadosGraficoViagens = (viagens) => {
    const dadosPorDia = {};
  
    viagens.forEach((viagem) => {
      const data = new Date(viagem.saida).toLocaleDateString();
      dadosPorDia[data] = (dadosPorDia[data] || 0) + 1;
    });
  
    return {
      labels: Object.keys(dadosPorDia),
      datasets: [
        {
          label: 'Viagens por Dia',
          data: Object.values(dadosPorDia),
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
        },
      ],
    };
  };
  
  export const processarDadosGraficoMotoristas = (estatisticas) => {
    return {
      labels: estatisticas.map((e) => e.nome),
      datasets: [
        {
          label: 'Total de Viagens',
          data: estatisticas.map((e) => e.total),
          backgroundColor: 'rgb(54, 162, 235)',
        },
      ],
    };
  };