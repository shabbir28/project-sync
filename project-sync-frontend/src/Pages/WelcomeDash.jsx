import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../Services/authContext'; 
import projectLogo from '../assets/project-sync-logo.jpeg';

const WelcomeDash = () => {
  const navigate = useNavigate();
  const { isLoggedIn, userRole } = useAuth();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    // Redirect if already logged in
    if (isLoggedIn) {
      if (userRole === 'manager') {
        navigate('/manager/dashboard');
      } else if (userRole === 'developer') {
        navigate('/developer/dashboard');
      }
    }
  }, [isLoggedIn, userRole, navigate]);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <img
                  className="h-10 w-10 rounded-md"
                  src={projectLogo}
                  alt="Project Sync"
                />
                <span className="ml-2 text-xl font-bold text-gray-800">Project Sync</span>
              </div>
            </div>
            <div className="flex items-center">
              <Link
                to="/login"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="ml-4 px-3 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="py-10">
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="text-center">
                    <img
                      src={projectLogo}
                      alt="Project Sync"
                      className="mx-auto h-32 w-32 rounded-lg mb-4"
                    />
                    <h1 className="text-3xl font-bold text-gray-900">{greeting}!</h1>
                    <p className="mt-2 text-lg text-gray-600">
                      Welcome to Project Sync - Your project management solution
                    </p>
                    <div className="mt-8 flex justify-center space-x-4">
                      <Link
                        to="/login"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Login
                      </Link>
                      <Link
                        to="/signup"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Sign Up
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default WelcomeDash; 