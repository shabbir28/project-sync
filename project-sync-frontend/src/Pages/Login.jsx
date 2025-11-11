import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../Services/authContext';
import projectLogo from '../assets/project-sync-logo.jpeg';
import trelloLeftImage from '../assets/trello-left.4f52d13c.svg';
import trelloRightImage from '../assets/trello-right.e6e102c7.svg';
import Navbar from '../Components/Navbar';
import Modal from '../Components/Common/Modal';
import Spinner from '../Components/Common/Spinner';

const Login = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotError, setForgotError] = useState('');

  // Backend URL from env
  const API_URL = process.env.REACT_APP_API_URL;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
    if (serverError) setServerError('');
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (validateForm()) {
      setIsLoading(true);
      try {
        // Use API_URL from env
        await login({ ...formData, apiUrl: API_URL });
      } catch (error) {
        console.error('Login error:', error);
        if (error.message) setServerError(error.message);
        else if (typeof error === 'string') setServerError(error);
        else setServerError('Invalid credentials. Please check your email and password.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotMessage('');
    if (!forgotEmail.trim()) {
      setForgotError('Email is required');
      return;
    }
    setForgotLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/user/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      if (res.ok) setForgotMessage(data.message || 'If this email exists, a reset link will be sent.');
      else setForgotError(data.message || 'Something went wrong.');
    } catch {
      setForgotError('Network error.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-50 relative overflow-hidden pt-16 md:pt-0">
        <img src={trelloLeftImage} alt="Trello Left" className="hidden md:block absolute left-0 top-1/2 transform -translate-y-1/2 w-64 opacity-30 z-0 pointer-events-none" style={{ maxHeight: '80vh' }} />
        <img src={trelloRightImage} alt="Trello Right" className="hidden md:block absolute right-0 top-1/2 transform -translate-y-1/2 w-64 opacity-30 z-0 pointer-events-none" style={{ maxHeight: '80vh' }} />
        <div className="relative z-10 max-w-md w-full mx-8 my-20">
          <div className="bg-white rounded-2xl shadow-2xl px-10 py-10 flex flex-col items-center">
            <img className="h-20 w-20 rounded-full shadow-lg mb-4 border-4 border-blue-200" src={projectLogo} alt="Project Sync" />
            <h2 className="text-3xl font-bold text-blue-800 mb-2">Welcome Back!</h2>
            <p className="text-gray-500 mb-6 text-center">
              Sign in to your account or <Link to="/signup" className="text-blue-600 font-semibold hover:underline">create a new account</Link>
            </p>
            {serverError && (
              <div className="mb-4 w-full bg-red-100 border-l-4 border-red-500 p-3 rounded">
                <p className="text-sm text-red-700">{serverError}</p>
              </div>
            )}
            <form className="w-full space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-blue-700 mb-1">Email address</label>
                <input id="email" name="email" type="email" autoComplete="email" value={formData.email} onChange={handleChange} className={`w-full px-4 py-2 border ${errors.email ? 'border-red-400' : 'border-blue-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50`} placeholder="Enter your email" />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-blue-700 mb-1">Password</label>
                <div className="relative">
                  <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={formData.password} onChange={handleChange} className={`w-full px-4 py-2 border ${errors.password ? 'border-red-400' : 'border-blue-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50`} placeholder="Enter your password" />
                  <button type="button" className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-500 text-xs focus:outline-none" onClick={() => setShowPassword((prev) => !prev)} tabIndex={-1}>{showPassword ? 'Hide' : 'Show'}</button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">Remember me</label>
                </div>
                <div className="text-sm">
                  <button type="button" className="text-blue-600 hover:underline bg-transparent border-none p-0 m-0 focus:outline-none" onClick={() => setShowForgotModal(true)}>Forgot password?</button>
                </div>
              </div>
              <button type="submit" disabled={isLoading} className="w-full py-2 px-4 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold rounded-lg shadow-md hover:from-blue-600 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60 transition-all duration-200">
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
              <div className="mt-4">
                <Link to="/signup" className="w-full py-2 px-4 border border-blue-500 text-blue-600 font-semibold rounded-lg shadow-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 flex items-center justify-center">Create New Account</Link>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Modal isOpen={showForgotModal} onClose={() => setShowForgotModal(false)}>
        <div className="p-6 w-80">
          <h3 className="text-lg font-semibold mb-2 text-blue-700">Forgot Password</h3>
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <input type="email" className="w-full px-3 py-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="Enter your email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} disabled={forgotLoading} />
            {forgotError && <p className="text-xs text-red-600">{forgotError}</p>}
            {forgotMessage && <p className="text-xs text-green-600">{forgotMessage}</p>}
            <button type="submit" className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60" disabled={forgotLoading}>
              {forgotLoading ? <Spinner size="sm" /> : 'Send Reset Link'}
            </button>
          </form>
        </div>
      </Modal>
    </>
  );
};

export default Login;
