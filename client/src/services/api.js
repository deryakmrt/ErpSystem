import axios from 'axios';

// API Base URL
const API_BASE_URL = 'http://localhost:5286/api';

// Axios instance oluştur
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;