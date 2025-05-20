import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../components/Layout";

const AdminUsuariosPage = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    nome: "",
    sobrenome: "",
    username: "",
    email: "",
    senha: "",
    cargo: "estagiario",
    setor: "Transporte"
  });
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  // Carregar usuários
  const carregarUsuarios = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/usuarios');
      setUsuarios(response.data);
      setError("");
    } catch (err) {
      console.error("Erro ao carregar usuários:", err);
      setError("Erro ao carregar usuários. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  // Manipular mudanças no formulário
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Manipular envio do formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      if (editMode) {
        // Atualizar usuário existente
        await axios.put(`/api/usuarios/${editId}`, formData);
      } else {
        // Criar novo usuário
        await axios.post('/api/registrar', formData);
      }
      
      // Limpar formulário e recarregar usuários
      setFormData({
        nome: "",
        sobrenome: "",
        username: "",
        email: "",
        senha: "",
        cargo: "estagiario",
        setor: "Transporte"
      });
      setEditMode(false);
      setEditId(null);
      
      carregarUsuarios();
    } catch (err) {
      console.error("Erro ao salvar usuário:", err);
      setError(err.response?.data?.message || "Erro ao salvar usuário. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Editar usuário
  const handleEdit = (usuario) => {
    setFormData({
      nome: usuario.nome,
      sobrenome: usuario.sobrenome,
      username: usuario.username,
      email: usuario.email,
      senha: "", // Não preencher a senha por segurança
      cargo: usuario.cargo,
      setor: usuario.setor
    });
    setEditMode(true);
    setEditId(usuario._id);
  };

  // Alternar status do usuário (ativo/inativo)
  const toggleStatus = async (id, ativo) => {
    try {
      await axios.patch(`/api/usuarios/${id}/status`, { ativo: !ativo });
      carregarUsuarios();
    } catch (err) {
      console.error("Erro ao alterar status do usuário:", err);
      setError("Erro ao alterar status do usuário. Tente novamente.");
    }
  };

  return (
    <Layout>
      <div className="container mt-4">
        <h2>Gerenciamento de Usuários</h2>
        
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        
        <div className="row">
          <div className="col-md-4">
            <div className="card">
              <div className="card-header">
                {editMode ? "Editar Usuário" : "Novo Usuário"}
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="nome" className="form-label">Nome</label>
                    <input
                      type="text"
                      id="nome"
                      name="nome"
                      className="form-control"
                      value={formData.nome}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="sobrenome" className="form-label">Sobrenome</label>
                    <input
                      type="text"
                      id="sobrenome"
                      name="sobrenome"
                      className="form-control"
                      value={formData.sobrenome}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="username" className="form-label">Nome de Usuário</label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      className="form-control"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="nome.sobrenome"
                      required
                    />
                    <small className="text-muted">Formato: nome.sobrenome</small>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="form-control"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="senha" className="form-label">Senha</label>
                    <input
                      type="password"
                      id="senha"
                      name="senha"
                      className="form-control"
                      value={formData.senha}
                      onChange={handleChange}
                      required={!editMode}
                      placeholder={editMode ? "Deixe em branco para manter a senha atual" : ""}
                    />
                    {editMode && (
                      <small className="text-muted">Deixe em branco para manter a senha atual</small>
                    )}
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="cargo" className="form-label">Cargo</label>
                    <select
                      id="cargo"
                      name="cargo"
                      className="form-select"
                      value={formData.cargo}
                      onChange={handleChange}
                      required
                    >
                      <option value="admin">Administrador</option>
                      <option value="gerente">Gerente</option>
                      <option value="estagiario">Estagiário</option>
                    </select>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="setor" className="form-label">Setor</label>
                    <input
                      type="text"
                      id="setor"
                      name="setor"
                      className="form-control"
                      value={formData.setor}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="d-grid gap-2">
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? "Salvando..." : (editMode ? "Atualizar" : "Cadastrar")}
                    </button>
                    
                    {editMode && (
                      <button 
                        type="button" 
                        className="btn btn-secondary"
                        onClick={() => {
                          setFormData({
                            nome: "",
                            sobrenome: "",
                            username: "",
                            email: "",
                            senha: "",
                            cargo: "estagiario",
                            setor: "Transporte"
                          });
                          setEditMode(false);
                          setEditId(null);
                        }}
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
          
          <div className="col-md-8">
            <div className="card">
              <div className="card-header">
                Lista de Usuários
              </div>
              <div className="card-body">
                {loading && !usuarios.length ? (
                  <p className="text-center">Carregando usuários...</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>Nome</th>
                          <th>Usuário</th>
                          <th>Email</th>
                          <th>Cargo</th>
                          <th>Setor</th>
                          <th>Status</th>
                          <th>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usuarios.map((usuario) => (
                          <tr key={usuario._id}>
                            <td>{usuario.nome} {usuario.sobrenome}</td>
                            <td>{usuario.username}</td>
                            <td>{usuario.email}</td>
                            <td>
                              {usuario.cargo === 'admin' && 'Administrador'}
                              {usuario.cargo === 'gerente' && 'Gerente'}
                              {usuario.cargo === 'estagiario' && 'Estagiário'}
                            </td>
                            <td>{usuario.setor}</td>
                            <td>
                              <span className={`badge ${usuario.ativo ? 'bg-success' : 'bg-danger'}`}>
                                {usuario.ativo ? 'Ativo' : 'Inativo'}
                              </span>
                            </td>
                            <td>
                              <button
                                className="btn btn-sm btn-primary me-1"
                                onClick={() => handleEdit(usuario)}
                              >
                                Editar
                              </button>
                              <button
                                className="btn btn-sm btn-warning"
                                onClick={() => toggleStatus(usuario._id, usuario.ativo)}
                              >
                                {usuario.ativo ? 'Desativar' : 'Ativar'}
                              </button>
                            </td>
                          </tr>
                        ))}
                        
                        {!usuarios.length && (
                          <tr>
                            <td colSpan="7" className="text-center">
                              Nenhum usuário encontrado.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminUsuariosPage;
