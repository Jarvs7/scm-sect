const Motorista = require("../models/Motorista");
const Veiculo = require("../models/Veiculo");
const Viagem = require("../models/Viagem");

// Função auxiliar para agrupar viagens por mês
function calcularViagensPorMes(viagens) {
    const viagensPorMes = {};
    viagens.forEach(viagem => {
        const mes = new Date(viagem.createdAt).toLocaleString('default', { month: 'short' });
        viagensPorMes[mes] = (viagensPorMes[mes] || 0) + 1;
    });
    return viagensPorMes;
}

// Função auxiliar para agrupar viagens por motorista
function calcularViagensPorMotorista(viagens) {
    const viagensPorMotorista = {};
    viagens.forEach(viagem => {
        const nomeMotorista = viagem.motorista.nome;
        viagensPorMotorista[nomeMotorista] = (viagensPorMotorista[nomeMotorista] || 0) + 1;
    });
    return viagensPorMotorista;
}

async function obterDadosAtualizados(filtros = {}) {
    try {
        // Consultas com filtros aplicados
        const [motoristas, veiculos, viagens] = await Promise.all([
            Motorista.find(filtros.motorista || {})
                .select("nome status cnh ultimaViagem")
                .sort("nome")
                .limit(100)
                .lean(),
            
            Veiculo.find(filtros.veiculo || {})
                .select("nome modelo placa status")
                .sort("nome")
                .limit(100)
                .lean(),
            
            Viagem.find(filtros.viagem || {})
                .populate("motorista")
                .populate("veiculo")
                .sort("-createdAt")
                .limit(100)
                .lean(),
        ]);

        // Processamento dos dados
        const viagensAtivas = viagens.filter(v => v.status === "em_andamento");
        const viagensFinalizadas = viagens.filter(v => v.status === "finalizada");
        const viagensCanceladas = viagens.filter(v => v.status === "cancelada");
        const motoristasEmViagem = viagensAtivas.map(v => v.motorista._id.toString());

        return {
            // Dados completos
            viagens,
            veiculos: veiculos.map(v => ({ ...v, disponivel: v.status === "livre" })),
            motoristas: motoristas.map(m => ({
                ...m,
                disponivel: !motoristasEmViagem.includes(m._id.toString()) && m.status === "livre",
            })),
            
            // Dados agrupados
            solicitacoes: viagensAtivas,
            finalizadas: viagensFinalizadas,
            canceladas: viagensCanceladas,
            
            // Estatísticas para cards
            estatisticas: {
                totalViagens: viagens.length,
                viagensEmAndamento: viagensAtivas.length,
                viagensFinalizadas: viagensFinalizadas.length,
                viagensCanceladas: viagensCanceladas.length,
                veiculosAtivos: veiculos.filter(v => v.status === "em uso").length,
                veiculosDisponiveis: veiculos.filter(v => v.status === "livre").length,
                motoristasAtivos: motoristasEmViagem.length,
                motoristasDisponiveis: motoristas.filter(m => m.status === "livre").length,
                totalMotoristas: motoristas.length,
            },
            
            // Dados para gráficos
            dadosGraficos: {
                viagensPorMes: calcularViagensPorMes(viagens),
                viagensPorMotorista: calcularViagensPorMotorista(viagens),
                viagensPorStatus: {
                    em_andamento: viagensAtivas.length,
                    finalizada: viagensFinalizadas.length,
                    cancelada: viagensCanceladas.length,
                }
            }
        };
    } catch (error) {
        console.error("Erro em obterDadosAtualizados:", error);
        throw error;
    }
}

module.exports = obterDadosAtualizados;