import axios from 'axios';
import { BASE_API_URL } from '../const/api';

const getToken = () => localStorage.getItem('authToken');

const apiClient = axios.create({
  baseURL: BASE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Request Interceptor ---
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- Response Interceptor ---
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // --- Global Error Handling ---
    if (error.response && error.response.status === 401) {
      console.error('Unauthorized request. Redirecting to login...');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;