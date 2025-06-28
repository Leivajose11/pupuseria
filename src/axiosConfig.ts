import axios from 'axios';

const instancia = axios.create({
  baseURL: 'http://localhost:4000/api',
});

// Interceptor para agregar el token a cada solicitud
instancia.interceptors.request.use(config => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instancia;
