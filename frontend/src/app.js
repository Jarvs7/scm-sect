import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Componentes
import Menu from "./components/Menu/Menu.jsx";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RelatoriosPage from "./pages/RelatoriosPage.jsx";
import StatusPage from "./pages/StatusPage";
import SolicitacaoPage from "./components/SolicitarViagem/SolicitacaoPage.jsx";
import RegistroViagemPage from "./pages/RegistroViagemPage";
import TransportRoute from "./components/TransportRoute";

// Redirecionador inteligente
const RedirectHome = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isAdmin = user?.role === "admin";
  const isTransporte = user?.role?.toLowerCase() === "transporte";

  if (isTransporte) {
    return <Navigate to="/registro-viagem" replace />;
  }

  // Admin e qualquer outro usuário comum
  return <Navigate to="/solicitar-viagem" replace />;
};


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          {/* Redirecionamento baseado no papel do usuário */}
          <Route path="/" element={<RedirectHome />} />

          {/* Rota para administradores ou setor transporte */}
          <Route element={<TransportRoute />}>
            <Route
              path="/registro-viagem"
              element={
                <>
                  <Menu visible={true} />
                  <RegistroViagemPage />
                </>
              }
            />
          </Route>

          {/* Usuários comuns */}
          <Route
            path="/solicitar-viagem"
            element={
              <>
                <Menu visible={true} />
                <SolicitacaoPage />
              </>
            }
          />

          <Route
            path="/relatorios"
            element={
              <>
                <Menu visible={true} />
                <RelatoriosPage />
              </>
            }
          />

          <Route
            path="/status"
            element={
              <>
                <Menu visible={true} />
                <StatusPage />
              </>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
