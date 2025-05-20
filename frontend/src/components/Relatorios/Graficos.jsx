import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import '../../styles/Relatorio/graficos.css';

const Graficos = ({ viagens = [], estatisticas = {} }) => {
  const chartViagensRef = useRef(null);
  const chartMotoristasRef = useRef(null);
  const [charts, setCharts] = useState({ viagens: null, motoristas: null });

  // Inicializa estatísticas vazias para evitar erros
  const estatisticasSeguras = {
    porMotorista: [],
    ...estatisticas
  };

  useEffect(() => {
    // Destrói gráficos existentes antes de criar novos
    if (charts.viagens) charts.viagens.destroy();
    if (charts.motoristas) charts.motoristas.destroy();

    if (viagens.length === 0 || !estatisticasSeguras.porMotorista) return;

    // Processa dados para gráfico de viagens por dia
    const dadosPorDia = viagens.reduce((acc, viagem) => {
      const data = new Date(viagem.saida).toLocaleDateString();
      acc[data] = (acc[data] || 0) + 1;
      return acc;
    }, {});

    // Cria novo gráfico de viagens
    const ctxViagens = chartViagensRef.current.getContext("2d");
    const novoChartViagens = new Chart(ctxViagens, {
      type: "line",
      data: {
        labels: Object.keys(dadosPorDia),
        datasets: [{
          label: "Viagens por Dia", 
          data: Object.values(dadosPorDia),
          borderColor: "rgb(75, 188, 192)"
        }],
      },
      options: {
        layout: {
          padding: 20
        },
        plugins: {
          legend: {
            display: true,
            labels: {
              color: "#ffffff", // Cor dos rótulos do eixo X
              font: {
                size: 20 // Tamanho da fonte dos rótulos do eixo X
              }
            }
          }
        },
        scales: {
          x: {
            ticks: {
              color: "#ffffff" // Cor branca para os rótulos do eixo X
            },
            grid: {
              color: "rgba(128, 128, 128, 0.3)" // Cor cinza translúcida para as linhas de grade
            }
          },
          y: {
            ticks: {
              color: "#ffffff" // Cor branca para os rótulos do eixo Y
            },
            grid: {
              color: "rgba(128, 128, 128, 0.3)" // Cor cinza translúcida para as linhas de grade
            }
          }
        }
      }
    });

    // Cria novo gráfico de motoristas
    const ctxMotoristas = chartMotoristasRef.current.getContext("2d");
    // Gera cores dinâmicas para cada motorista
    const coresMotoristas = estatisticasSeguras.porMotorista.map(() => {
      const r = Math.floor(Math.random() * 256);
      const g = Math.floor(Math.random() * 256);
      const b = Math.floor(Math.random() * 256);
      return `rgb(${r}, ${g}, ${b})`;
    });
    const novoChartMotoristas = new Chart(ctxMotoristas, {
      type: "bar",
      data: {
        labels: estatisticasSeguras.porMotorista.map((e) => e.nome),
        datasets: [{
          label: "Total de Viagens",
          data: estatisticasSeguras.porMotorista.map((e) => e.total),
          backgroundColor: coresMotoristas,
        }],
      },
      options: {
        layout: {
          padding: 20
        },
        plugins: {
          legend: {
            display: true,
            labels: {
              color: "#ffffff", // Cor dos rótulos do eixo X
              font: {
                size: 20 // Tamanho da fonte dos rótulos do eixo X
              }
            }
          }
        },
        scales: {
          x: {
            ticks: {
              color: "#ffffff" // Cor branca para os rótulos do eixo X
            },
            grid: {
              color: "rgba(128, 128, 128, 0.3)" // Cor cinza translúcida para as linhas de grade
            }
          },
          y: {
            ticks: {
              color: "#ffffff" // Cor branca para os rótulos do eixo Y
            },
            grid: {
              color: "rgba(128, 128, 128, 0.3)" // Cor cinza translúcida para as linhas de grade
            }
          }
        }
      }
    });

    setCharts({
      viagens: novoChartViagens,
      motoristas: novoChartMotoristas
    });

    // Limpeza ao desmontar
    return () => {
      if (novoChartViagens) novoChartViagens.destroy();
      if (novoChartMotoristas) novoChartMotoristas.destroy();
    };
  }, [viagens, estatisticasSeguras.porMotorista]);

  return (
    <div className="row mb-4">
      <div className="col-md-6">
        <canvas ref={chartViagensRef} className="grafico-viagens"></canvas>
      </div>
      <div className="col-md-6">
        <canvas ref={chartMotoristasRef} className="grafico-motoristas"></canvas>
      </div>
    </div>
  );
};

export default Graficos;