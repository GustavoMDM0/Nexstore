import axios from 'axios';

const api = axios.create({
  baseURL: 'https://nexstore-tz6u.onrender.com/api', 
  timeout: 30000, // 30 segundos de espera
});

export default api;