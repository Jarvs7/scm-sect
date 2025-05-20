import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "../styles/Login/login.css";
import { AuthContext } from "../context/AuthContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    username: "",
    senha: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/login", {
        username: formData.username.trim(),
        senha: formData.senha.trim(),
      });

      const { token, user } = res.data;

      // Armazena no localStorage
      console.log('Token recebido no login:', token);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify({ ...user, token }));
      console.log('Dados armazenados no localStorage:', {
        token: localStorage.getItem('token'),
        user: localStorage.getItem('user')
      });

      // Atualiza o contexto global
      login({ ...user, token });

      // Redirecionamento por perfil
      const isAdmin = user.role === "admin";
      const isTransporte = user.role?.toLowerCase() === "transporte";

      if (isTransporte) {
        navigate("/registro-viagem");
      } else if (isAdmin) {
        navigate("/solicitar-viagem");
      } else {
        // Usuário comum
        navigate("/solicitar-viagem");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Falha na conexão com o servidor"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="triangles-container">
          <div className="triangle triangle-top-left"></div>
          <div className="triangle triangle-top-right"></div>
          <div className="triangle triangle-bottom-left"></div>
          <div className="triangle triangle-bottom-right"></div>
        </div>

        <div className="login-box">
          <h2 className="login-title">
            <img
              src="/assets/logosistema1.png"
              alt="Ícone SCM"
              className="login-icon"
              style={{
                width: "48px",
                height: "48px",
                marginRight: "12px",
                filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.2))",
              }}
            />
            Login do Sistema
          </h2>

          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="text"
                name="username"
                placeholder="Usuário"
                className="login-input"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                required
                disabled={loading}
              />
            </div>

            <div className="input-group password-group">
              <input
                type={showPassword ? "text" : "password"}
                name="senha"
                placeholder="Senha"
                className="login-input"
                value={formData.senha}
                onChange={(e) =>
                  setFormData({ ...formData, senha: e.target.value })
                }
                required
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? <span className="loading-spinner"></span> : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
