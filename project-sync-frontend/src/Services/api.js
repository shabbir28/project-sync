import axios from 'axios';

// Base Axios instance
const API_URL = import.meta.env.VITE_API_URL;

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  withCredentials: true, // cookie bhejne ke liye
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
});

// Request interceptor (simple logging only)
axiosInstance.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor (simple logging only)
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response.data; // data return karega directly
  },
  (error) => {
    console.error('API Error:', error);

    const { response } = error;
    if (response) {
      console.error('Error response:', response.status, response.data);

      switch (response.status) {
        case 401:
          console.error('Unauthorized – session expired or login required');
          break;
        case 403:
          console.error('Forbidden – you do not have permission');
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 500:
          console.error('Server error');
          break;
        default:
          console.error('Unknown error', response.data?.message || '');
      }
      return Promise.reject(response.data);
    }

    console.error('Network error:', error.message);
    return Promise.reject({
      message: 'Network error or server unavailable',
      error
    });
  }
);

export default axiosInstance;
