import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../Services/authContext';
import { 
  FiHome, 
  FiUsers, 
  FiBriefcase, 
  FiClipboard, 
  FiLogOut,
  FiChevronDown,
  FiChevronRight,
  FiUserCheck,
  FiAlertCircle,
  FiUserPlus,
  FiPlus
} from 'react-icons/fi';
import projectLogo from '../assets/project-sync-logo.jpeg';

export default function Sidebar() {
  const { userRole, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState({
    Teams: false,
    Clients: false,
    Projects: false,
    Tasks: false,
    Bugs: false
  });

  // Define navigation items based on user role
  const navigationItems = userRole === 'manager' ? managerNavigation : developerNavigation;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSubmenu = (name) => {
    setExpanded(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  return (
    <div className="h-screen w-64 bg-white fixed overflow-y-auto border-r border-gray-200 shadow-sm flex flex-col">
      <div className="flex items-center p-5 border-b border-gray-200">
        <img src={projectLogo} alt="Project Sync" className="h-8 w-8 mr-3 rounded-md object-cover" />
        <h1 className="text-xl font-bold text-gray-800">Project Sync</h1>
      </div>

      <nav className="flex-1 mt-2 pb-20">
        {navigationItems.map((item) => {
          const isActive = location.pathname.startsWith(item.href);
          // Check if this item has children
          const hasChildren = item.children && item.children.length > 0;
          
          return (
            <div key={item.name} className="mb-1">
              {hasChildren ? (
                // Item with dropdown
                <div>
                  <button
                    onClick={() => toggleSubmenu(item.name)}
                    className={`flex items-center justify-between w-full px-5 py-3 text-sm transition-colors ${
                      isActive 
                        ? 'bg-blue-50 text-blue-600 font-medium' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <item.icon className={`h-5 w-5 mr-3 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                      <span>{item.name}</span>
                    </div>
                    {expanded[item.name] ? (
                      <FiChevronDown className="h-4 w-4" />
                    ) : (
                      <FiChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  
                  {/* Submenu */}
                  {expanded[item.name] && (
                    <div className="bg-gray-50 py-1">
                      {item.children.map((subItem) => (
                        <NavLink
                          key={subItem.name}
                          to={subItem.href}
                          className={({ isActive }) => 
                            `flex items-center pl-12 pr-5 py-2 text-sm ${
                              isActive 
                                ? 'text-blue-600 font-medium bg-blue-50' 
                                : 'text-gray-600 hover:bg-gray-100'
                            } transition-colors`
                          }
                        >
                          <subItem.icon className={`h-4 w-4 mr-3`} />
                          <span>{subItem.name}</span>
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // Regular item without dropdown
                <NavLink
                  to={item.href}
                  className={({ isActive }) => 
                    `flex items-center px-5 py-3 text-sm ${
                      isActive 
                        ? 'bg-blue-50 text-blue-600 font-medium' 
                        : 'text-gray-700 hover:bg-gray-50'
                    } transition-colors`
                  }
                >
                  <item.icon className={`h-5 w-5 mr-3 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span>{item.name}</span>
                </NavLink>
              )}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-gray-200 p-4 bg-white">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
        >
          <FiLogOut className="h-5 w-5 mr-3 text-gray-500" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

// Navigation items for manager with dropdowns
const managerNavigation = [
  { name: 'Dashboard', href: '/manager/dashboard', icon: FiHome },
  { 
    name: 'Teams', 
    icon: FiUsers,
    children: [
      { name: 'All Teams', href: '/manager/teams', icon: FiUsers },
      { name: 'Create Team', href: '/manager/teams/create', icon: FiPlus }
    ]
  },
  { name: 'Employees', href: '/manager/employees', icon: FiUserPlus },
  { 
    name: 'Clients', 
    icon: FiUserCheck,
    children: [
      { name: 'All Clients', href: '/manager/clients', icon: FiUserCheck },
      { name: 'Add Client', href: '/manager/clients/create', icon: FiPlus }
    ]
  },
  { 
    name: 'Projects', 
    icon: FiBriefcase,
    children: [
      { name: 'All Projects', href: '/manager/projects', icon: FiBriefcase },
      { name: 'Create Project', href: '/manager/projects/create', icon: FiPlus }
    ]
  },
  { 
    name: 'Tasks', 
    icon: FiClipboard,
    children: [
      { name: 'All Tasks', href: '/manager/tasks', icon: FiClipboard },
      { name: 'Create Task', href: '/manager/tasks/create', icon: FiPlus }
    ]
  },
  { 
    name: 'Bugs', 
    icon: FiAlertCircle,
    children: [
      { name: 'All Bugs', href: '/manager/bugs', icon: FiAlertCircle },
      { name: 'Create Bug', href: '/manager/bugs/create', icon: FiPlus }
    ]
  }
];

// Navigation items for developer with dropdowns
const developerNavigation = [
  { name: 'Dashboard', href: '/developer/dashboard', icon: FiHome },
  { 
    name: 'Tasks', 
    icon: FiClipboard,
    children: [
      { name: 'My Tasks', href: '/developer/tasks', icon: FiClipboard }
    ]
  },
  { 
    name: 'Bugs', 
    icon: FiAlertCircle,
    children: [
      { name: 'My Bugs', href: '/developer/bugs', icon: FiAlertCircle }
    ]
  },
  { name: 'My Teams', href: '/developer/my-teams', icon: FiUsers },
  { name: 'Projects', href: '/developer/projects', icon: FiBriefcase }
]; 