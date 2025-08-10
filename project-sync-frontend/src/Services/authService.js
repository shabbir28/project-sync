import axiosInstance from './api';

/**
 * Authentication service for user operations
 */
const authService = {
  /**
   * Register a new user
   * @param {Object} userData - User signup data
   * @param {string} userData.username - Username
   * @param {string} userData.email - Email address
   * @param {string} userData.password - Password
   * @returns {Promise} API response
   */
  signup: async (userData) => {
    try {
      return await axiosInstance.post('/user/signup', userData);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Login a user
   * @param {Object} credentials - User login credentials
   * @param {string} credentials.email - Email address
   * @param {string} credentials.password - Password
   * @returns {Promise} API response
   */
  login: async (credentials) => {
    try {
      const response = await axiosInstance.post('/user/login', credentials);

      // Store token in localStorage if available
      if (response.token) {
        localStorage.setItem('token', response.token);
      }

      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Logout the current user
   * @returns {Promise} API response
   */
  logout: async () => {
    try {
      const response = await axiosInstance.post('/user/logout');

      // Clear token from localStorage
      localStorage.removeItem('token');

      return response;
    } catch (error) {
      // Clear token even if API call fails
      localStorage.removeItem('token');
      throw error;
    }
  },

  /**
   * Get the current user's profile
   * @returns {Promise} API response
   */
  getProfile: async () => {
    try {
      return await axiosInstance.get('/user/profile');
    } catch (error) {
      throw error;
    }
  },
};

export default authService; 