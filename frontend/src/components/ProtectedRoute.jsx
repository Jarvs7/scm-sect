import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import api from "../utils/api";

const ProtectedRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const validateToken = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log(
          "Token recuperado do localStorage:",
          token ? `${token.substring(0, 10)}...` : "Nenhum token"
        );

        if (!token) {
          console.warn("Nenhum token encontrado no localStorage");
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        console.log("Iniciando validação do token...");
        const response = await api.get("/auth/validate");
        console.log("Resposta da validação:", {
          status: response.status,
          data: response.data,
        });

        if (!response.data?.valid) {
          throw new Error(response.data?.message || "Token inválido");
        }
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Erro na validação do token:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, []);

  if (isLoading) {
    return <div>Carregando...</div>;
  }
  if (isAuthenticated === true) return <Outlet />;
  if (isAuthenticated === false) return <Navigate to="/login" replace />;
  return <div>Carregando...</div>;
};

export default ProtectedRoute;
