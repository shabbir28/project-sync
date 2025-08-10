import { Navigate } from 'react-router-dom';
import { useAuth } from '../Services/authContext';
import { toast } from 'react-toastify';

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, loading } = useAuth();

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

  return children;
};

export default ProtectedRoute; 