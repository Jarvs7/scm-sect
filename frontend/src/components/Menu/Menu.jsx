// frontend/src/components/Menu/Menu.jsx
import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Car, Info, BarChart2, LogOut } from "lucide-react";
import "../../styles/Menu/menu.css";

const Menu = ({ visible }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const isAdmin = user?.role === "admin";
  const isTransporte = user?.role?.toLowerCase() === "transporte";
  const isUser = user?.role === "usuario" || user?.role === "user";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const isActive = (path) => (location.pathname === path ? "active" : "");

  return (
    <div className={`menu-sidebar ${visible ? "visible" : ""}`}>
      <div className="user-profile">
        <img src="/assets/logosistema1.png" alt="Logo" className="user-logo" />
        <div className="user-info">
          <h5>{user.nome || "Usuário"}</h5>
        </div>
      </div>

      <ul className="menu-items">
        {/* Usuários COMUNS (exceto transporte) e Admins */}
        {((user?.role === "usuario" && !isTransporte) || isAdmin) && (
          <li className={isActive("/solicitar-viagem")}>
            <Link to="/solicitar-viagem">
              <Car size={20} strokeWidth={1.75} className="lucide-icon" color="#fff" />
              <span>Solicitar Viagem</span>
            </Link>
          </li>
        )}

        {/* Transporte e Admin */}
        {(isAdmin || isTransporte) && (
          <>
            <li className={isActive("/registro-viagem")}>
              <Link to="/registro-viagem">
                <Car size={20} strokeWidth={1.75} className="lucide-icon" color="#fff" />
                <span>Registro de Viagem</span>
              </Link>
            </li>

            <li className={isActive("/status")}>
              <Link to="/status">
                <Info size={20} strokeWidth={1.75} className="lucide-icon" color="#fff" />
                <span>Status</span>
              </Link>
            </li>
          </>
        )}

        {/* Apenas Admin */}
        {isAdmin && (
          <li className={isActive("/relatorios")}>
            <Link to="/relatorios">
              <BarChart2 size={20} strokeWidth={1.75} className="lucide-icon" color="#fff" />
              <span>Relatórios</span>
            </Link>
          </li>
        )}

        {/* Sair */}
        <li>
          <button onClick={handleLogout} className="logout-button">
            <LogOut size={18} strokeWidth={1.75} className="lucide-icon" color="#fff" />
            <span>Sair</span>
          </button>
        </li>
      </ul>
    </div>
  );
};

export default Menu;
