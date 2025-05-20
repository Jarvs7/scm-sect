

import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Menu from "../components/Menu/Menu.jsx";
import "../styles/Relatorio/dashboard.css";

const DashboardPage = () => {
    const [dados, setDados] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDados = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch("/api/dashboard", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                
                if (!response.ok) {
                    throw new Error("Falha ao carregar dados");
                }
                
                const data = await response.json();
                setDados(data);
            } catch (err) {
                setError(err.message);
                console.error("Erro ao buscar dados:", err);
            } finally {
                setLoading(false);
            }
        };
        
        fetchDados();
    }, []);

    return (
        <div className="dashboard-container">
            <Header />
            <div className="dashboard-content">
                <Menu />
                <main className="main-content">
                    <div className="container-fluid p-4">
                        <h2 className="page-title">Dashboard</h2>
                        
                        {loading && (
                            <div className="text-center my-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Carregando...</span>
                                </div>
                            </div>
                        )}
                        
                        {error && (
                            <div className="alert alert-danger" role="alert">
                                {error}
                            </div>
                        )}
                        
                        {dados && (
                            <div className="row">
                                <div className="col-md-3">
                                    <div className="card dashboard-card">
                                        <div className="card-body">
                                            <h5 className="card-title">Viagens Ativas</h5>
                                            <p className="card-value">{dados.viagensAtivas || 0}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="col-md-3">
                                    <div className="card dashboard-card">
                                        <div className="card-body">
                                            <h5 className="card-title">Motoristas Disponíveis</h5>
                                            <p className="card-value">{dados.motoristasDisponiveis || 0}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="col-md-3">
                                    <div className="card dashboard-card">
                                        <div className="card-body">
                                            <h5 className="card-title">Veículos Disponíveis</h5>
                                            <p className="card-value">{dados.veiculosDisponiveis || 0}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="col-md-3">
                                    <div className="card dashboard-card">
                                        <div className="card-body">
                                            <h5 className="card-title">Total de Viagens</h5>
                                            <p className="card-value">{dados.totalViagens || 0}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Adicione mais cards e gráficos conforme necessário */}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardPage;
