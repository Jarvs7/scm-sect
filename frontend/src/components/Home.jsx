import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";

const Home = () => {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulando carregamento de dados
    setTimeout(() => {
      setDados({
        viagensAtivas: 5,
        motoristasDisponiveis: 8,
        veiculosDisponiveis: 12
      });
      setLoading(false);
    }, 1000);
  }, []);
  
  return (
    <Layout title="Dashboard" icon="dashboard">
      <div className="container-fluid">
        {loading ? (
          <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Carregando...</span>
            </div>
          </div>
        ) : (
          <div className="row">
            <div className="col-md-4">
              <div className="card mb-4">
                <div className="card-body">
                  <h5 className="card-title">Viagens Ativas</h5>
                  <p className="display-4">{dados.viagensAtivas}</p>
                </div>
              </div>
            </div>
            
            <div className="col-md-4">
              <div className="card mb-4">
                <div className="card-body">
                  <h5 className="card-title">Motoristas Disponíveis</h5>
                  <p className="display-4">{dados.motoristasDisponiveis}</p>
                </div>
              </div>
            </div>
            
            <div className="col-md-4">
              <div className="card mb-4">
                <div className="card-body">
                  <h5 className="card-title">Veículos Disponíveis</h5>
                  <p className="display-4">{dados.veiculosDisponiveis}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Home;
