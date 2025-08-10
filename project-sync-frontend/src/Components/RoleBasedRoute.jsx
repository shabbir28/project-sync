import { Navigate } from 'react-router-dom';
import { useAuth } from '../Services/authContext';
import { toast } from 'react-toastify';

/**
 * Role-based protected route component
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components
 * @param {Array<string>} props.allowedRoles - Array of roles allowed to access the route
 * @param {string} props.redirectPath - Path to redirect to if access is denied
 * @returns {ReactNode} - The wrapped component or redirect
 */
const RoleBasedRoute = ({ children, allowedRoles, redirectPath = '/login' }) => {
  const { isLoggedIn, loading, userRole } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    toast.error('Please login to access this page');
    return <Navigate to="/login" replace />;
  }

  // If user doesn't have the required role
  if (!allowedRoles.includes(userRole)) {
    toast.error(`Access denied. You don't have permission to view this page.`);
    
    // Redirect to the appropriate dashboard based on role
    const appropriatePath = userRole === 'manager' ? '/manager/dashboard' : '/developer/dashboard';
    return <Navigate to={redirectPath || appropriatePath} replace />;
  }

  return children;
};

export default RoleBasedRoute; 