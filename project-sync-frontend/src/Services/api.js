import axios from 'axios';

// Create a base axios instance
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method.toUpperCase(), config.url);

    // Add auth token from localStorage if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Ensure headers are properly set for all methods
    if (['post', 'put', 'patch'].includes(config.method)) {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    // Check if there's a token in the response and store it
    if (response.data && response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    // Any status code within the range of 2xx
    return response.data;
  },
  (error) => {
    console.error('API Error:', error);

    // Handle specific error status codes
    const { response } = error;

    if (response) {
      console.error('Error response:', response.status, response.data);

      // Handle different error status codes
      switch (response.status) {
        case 401:
          // Unauthorized - clear token and consider redirect
          localStorage.removeItem('token');
          console.error('Session expired or unauthorized access');
          break;
        case 403:
          console.error('Forbidden access: You do not have permission for this action');
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 500:
          console.error('Server error');
          break;
        default:
          console.error('An error occurred:', response.status, response.data?.message || 'Unknown error');
      }

      return Promise.reject(response.data);
    }

    // Network error or other issues
    console.error('Network error:', error.message);
    return Promise.reject({
      message: 'Network error or server is unavailable',
      error: error
    });
  }
);

export default axiosInstance; 