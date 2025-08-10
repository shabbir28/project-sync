import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getManagerDevelopers } from '../../Services/userService';
import { useAuth } from '../../Services/authContext';
import { FiUser, FiMail, FiSearch, FiUsers, FiUserCheck, FiClipboard } from 'react-icons/fi';

const EmployeesList = () => {
  const navigate = useNavigate();
  const { isLoggedIn, userRole } = useAuth();
  const [developers, setDevelopers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    if (userRole !== 'manager') {
      navigate('/');
      return;
    }

    fetchDevelopers();
  }, [isLoggedIn, navigate, userRole]);

  const fetchDevelopers = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching developers...');
      const response = await getManagerDevelopers();
      console.log('Developer response:', response);
      if (response && response.status === 'SUCCESS') {
        setDevelopers(response.developers || []);
      } else {
        toast.error(response?.message || 'Failed to fetch employees');
        console.error('Failed response:', response);
      }
    } catch (error) {
      toast.error('Error fetching employees');
      console.error('Error fetching employees:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDevelopers = developers.filter(developer => {
    return (
      developer.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      developer.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Employee Management</h2>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search employees by name or email..."
            className="pl-10 pr-4 py-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-2 text-gray-600">Loading employees...</p>
        </div>
      ) : filteredDevelopers.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <FiUsers className="mx-auto text-4xl text-yellow-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
          <p className="text-gray-600">
            {searchTerm 
              ? 'No employees match your search criteria.' 
              : 'You don\'t have any employees working in your teams yet.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredDevelopers.map((developer) => (
            <div key={developer._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-4">
                    <FiUser className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{developer.username}</h3>
                    <div className="flex items-center text-gray-500 text-sm">
                      <FiMail className="mr-1" />
                      <span>{developer.email}</span>
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Role</p>
                      <p className="font-medium">Developer</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Joined</p>
                      <p className="font-medium">
                        {formatDate(developer.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                    onClick={() => navigate(`/manager/tasks/create`, { state: { developerId: developer._id } })}
                  >
                    <FiClipboard className="mr-1" /> Assign Task
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeesList; 