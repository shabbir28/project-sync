import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FiMenu, 
  FiBell, 
  FiSearch,
  FiUser,
  FiSettings,
  FiLogOut,
  FiPlus
} from 'react-icons/fi';
import { useAuth } from '../Services/authContext';

const Topbar = ({ setSidebarOpen }) => {
  const { currentUser, userRole, logout } = useAuth();
  const [username, setUsername] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const location = useLocation();

  // Extract page title from pathname
  const getPageTitle = () => {
    const path = location.pathname;
    
    // Check if we're on a specific page
    if (path.includes('/dashboard')) {
      return 'Dashboard';
    } else if (path.includes('/profile')) {
      return 'Profile';
    } else if (path.includes('/teams')) {
      return 'Teams';
    } else if (path.includes('/invitations')) {
      return 'Team Invitations';
    } else if (path.includes('/my-teams')) {
      return 'My Teams';
    }
    
    // Default title
    return userRole === 'manager' ? 'Manager Dashboard' : 'Developer Dashboard';
  }
  
  useEffect(() => {
    if (currentUser && (currentUser.username || currentUser.email)) {
      setUsername(currentUser.username || currentUser.email);
    }
  }, [currentUser]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  return (
    <header className="bg-white shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Left side */}
        <div className="flex items-center">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-600 focus:outline-none md:hidden"
          >
            <FiMenu className="h-6 w-6" />
          </button>
          
          <div className="ml-4 md:ml-0">
            <h1 className="text-lg font-semibold text-gray-800">
              {getPageTitle()}
            </h1>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* New Team Button - Show only on teams page for managers */}
          {userRole === 'manager' && location.pathname.includes('/manager/teams') && !location.pathname.includes('/create') && (
            <Link
              to="/manager/teams/create"
              className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <FiPlus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              New Team
            </Link>
          )}

          {/* Notifications */}
          <button className="relative p-2 text-gray-500 hover:text-gray-700 focus:outline-none">
            <FiBell className="h-6 w-6" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
          </button>

          {/* User menu */}
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center space-x-2 rounded-full p-1 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none"
            >
              <div className="h-8 w-8 rounded-full bg-blue-500 text-center text-sm font-medium leading-8 text-white">
                {username ? username.charAt(0).toUpperCase() : (userRole === 'manager' ? 'M' : 'D')}
              </div>
              <span className="hidden text-sm font-medium md:block">{username || 'User'}</span>
            </button>
            
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <Link
                  to={`/${userRole}/profile`}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FiUser className="mr-3 h-5 w-5 text-gray-500" />
                  Profile
                </Link>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    logout();
                  }}
                  className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <FiLogOut className="mr-3 h-5 w-5 text-gray-500" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar; 