import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../Services/authContext';
import { FiMenu, FiX } from 'react-icons/fi';
import projectLogo from '../assets/projectsync-logo.png';

const Navbar = () => {
  const { isLoggedIn, logout, userRole } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // Get the correct dashboard URL based on user role
  const getDashboardUrl = () => {
    if (userRole === 'manager') {
      return '/manager/dashboard';
    } else if (userRole === 'developer') {
      return '/developer/dashboard';
    }
    return '/login';
  };

  // Function to determine if a link is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Common link styles
  const linkStyles = (path) => `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
    isActive(path)
      ? 'text-indigo-800 bg-indigo-50'
      : 'text-gray-700 hover:text-indigo-800 hover:bg-indigo-50'
  }`;

  // Close mobile menu when clicking a link
  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow fixed w-full top-0 z-50 hidden md:block">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center" onClick={handleLinkClick}>
              <img src={projectLogo} alt="Project Sync" className="h-8 w-8 mr-2 object-contain" />
              <span className="font-bold text-xl text-gray-800">Project Sync</span>
            </Link>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-">
            <Link to="/" className={linkStyles('/')}>
              Home
            </Link>
            <Link to="/about" className={linkStyles('/about')}>
              About
            </Link>
            <Link to="/contact" className={linkStyles('/contact')}>
              Contact
            </Link>
            
            {isLoggedIn ? (
              <div className="flex items-center space-x-2">
                <Link
                  to={getDashboardUrl()}
                  className="ml-4 px-4 py-2 rounded-md text-sm font-medium text-white bg-gradient-to-r from-indigo-800 to-purple-800 hover:from-indigo-900 hover:to-purple-900 transition-all duration-200"
                >
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="px-4 py-2 rounded-md text-sm font-medium text-red-600 border border-red-600 hover:bg-red-50 transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-md text-sm font-medium text-indigo-800 border border-indigo-800 hover:bg-indigo-50 transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 rounded-md text-sm font-medium text-white bg-gradient-to-r from-indigo-800 to-purple-800 hover:from-indigo-900 hover:to-purple-900 transition-all duration-200"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none transition-colors duration-200"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">{isMenuOpen ? 'Close menu' : 'Open menu'}</span>
              {isMenuOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden bg-white transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link
            to="/"
            className={`block ${linkStyles('/')}`}
            onClick={handleLinkClick}
          >
            Home
          </Link>
          <Link
            to="/about"
            className={`block ${linkStyles('/about')}`}
            onClick={handleLinkClick}
          >
            About
          </Link>
          <Link
            to="/contact"
            className={`block ${linkStyles('/contact')}`}
            onClick={handleLinkClick}
          >
            Contact
          </Link>
          
          {isLoggedIn ? (
            <>
              <Link
                to={getDashboardUrl()}
                className="block px-3 py-2 rounded-md text-base font-medium text-white bg-gradient-to-r from-indigo-800 to-purple-800 hover:from-indigo-900 hover:to-purple-900 transition-all duration-200"
                onClick={handleLinkClick}
              >
                Dashboard
              </Link>
              <button
                onClick={() => {
                  logout();
                  handleLinkClick();
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 transition-colors duration-200"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="block px-3 py-2 rounded-md text-base font-medium text-indigo-800 hover:bg-indigo-50 transition-colors duration-200"
                onClick={handleLinkClick}
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="block px-3 py-2 rounded-md text-base font-medium text-white bg-gradient-to-r from-indigo-800 to-purple-800 hover:from-indigo-900 hover:to-purple-900 transition-all duration-200"
                onClick={handleLinkClick}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 