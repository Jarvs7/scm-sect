import { createContext, useState, useEffect } from "react";

// Cria o contexto
export const AuthContext = createContext();

// Provider para encapsular a aplicação
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Carrega do localStorage ao iniciar
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Função de login
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", userData.token); // se quiser armazenar separadamente
  };

  // Função de logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
