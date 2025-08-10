import { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from './authService';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const response = await authService.getProfile();
        setCurrentUser(response.user);
        setUserRole(response.user.role);
        setIsLoggedIn(true);
      } catch (error) {
        console.log('User not logged in');
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await authService.login(credentials);
      
      // Make sure we have the user data we need
      if (!response || !response.role) {
        throw new Error('Invalid response from server');
      }
      
      // Store token in localStorage if not already stored by the service
      if (response.token) {
        localStorage.setItem('token', response.token);
      }
      
      setCurrentUser(response.user || response.userId);
      setUserRole(response.role);
      setIsLoggedIn(true);
      toast.success('Login successful!');
      
      // Redirect based on role
      if (response.role === 'manager') {
        navigate('/manager/dashboard');
      } else if (response.role === 'developer') {
        navigate('/developer/dashboard');
      } else {
        // Default fallback
        navigate('/login');
        throw new Error('Unknown user role: ' + response.role);
      }
      
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    try {
      setLoading(true);
      const response = await authService.signup(userData);
      toast.success('Account created successfully!');
      return response;
    } catch (error) {
      const errorMessage = error.message || 'Signup failed';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
      setCurrentUser(null);
      setUserRole(null);
      setIsLoggedIn(false);
      toast.info('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Error logging out');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    userRole,
    isLoggedIn,
    loading,
    login,
    signup,
    logout,
    isManager: userRole === 'manager',
    isDeveloper: userRole === 'developer'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext; 