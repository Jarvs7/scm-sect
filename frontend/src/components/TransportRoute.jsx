import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const TransportRoute = () => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isAdmin = user.role === 'admin';
  const isTransporte = user.role?.toLowerCase() === 'transporte';

  if (isAdmin || isTransporte) {
    return <Outlet />;
  }

  return (
    <div className="container mt-5 text-center">
      <h2>🔒 Acesso Negado</h2>
      <p>Você não tem permissão para acessar esta página.</p>
    </div>
  );
};

export default TransportRoute;
