// ✅ frontend/src/utils/api.js
import axios from "axios";


const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://192.168.0.92:1120/api",
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const authToken = token || user?.token;

    if (authToken) {
      console.log('Adicionando token à requisição:', authToken.substring(0, 10) + '...');
      config.headers.Authorization = `Bearer ${authToken}`;
      console.log('Headers configurados:', config.headers);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;