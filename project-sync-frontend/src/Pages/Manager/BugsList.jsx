import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getAllBugs, deleteBug } from '../../Services/bugService';
import { useAuth } from '../../Services/authContext';
import { FaPlus, FaEdit, FaTrash, FaExclamationTriangle, FaFilter, FaSearch } from 'react-icons/fa';
import Spinner from '../../Components/Common/Spinner';
import Modal from '../../Components/Common/Modal';

const BugsList = () => {
  const navigate = useNavigate();
  const { isLoggedIn, userRole } = useAuth();
  const [bugs, setBugs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBugId, setSelectedBugId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    fetchBugs();
  }, [isLoggedIn, navigate]);

  const fetchBugs = async () => {
    setIsLoading(true);
    try {
      const response = await getAllBugs();
      if (response.status === 'SUCCESS') {
        setBugs(response.bugs || []);
      } else {
        toast.error(response.message || 'Failed to fetch bugs');
      }
    } catch (error) {
      toast.error('Error fetching bugs');
      console.error('Error fetching bugs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (bugId, e) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedBugId(bugId);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await deleteBug(selectedBugId);
      if (response.status === 'SUCCESS') {
        toast.success('Bug deleted successfully');
        fetchBugs();
      } else {
        toast.error(response.message || 'Failed to delete bug');
      }
    } catch (error) {
      toast.error('Error deleting bug');
      console.error('Error deleting bug:', error);
    } finally {
      setShowDeleteModal(false);
      setSelectedBugId(null);
    }
  };

  const handleCloseModal = () => {
    setShowDeleteModal(false);
    setSelectedBugId(null);
  };

  const getPriorityBadge = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">High</span>;
      case 'medium':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Medium</span>;
      case 'low':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Low</span>;
      default:
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Unknown</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Active</span>;
      case 'completed':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Completed</span>;
      default:
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Unknown</span>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Filter bugs based on search term and filters
  const filteredBugs = bugs.filter(bug => {
    const matchesSearch = 
      bug.bug_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bug.bug_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bug.project_id?.project_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || bug.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || bug.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Bugs Management</h1>
        <p className="text-gray-600">View and manage all bugs in your projects</p>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          {/* Search bar */}
          <div className="relative w-64">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <FaSearch className="text-gray-400" />
            </span>
            <input
              type="text"
              className="pl-10 pr-4 py-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search bugs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Status filter */}
          <div className="flex items-center">
            <FaFilter className="text-gray-500 mr-2" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          
          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        
        {userRole === 'manager' && (
          <Link 
            to="/manager/bugs/create" 
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <FaPlus className="mr-2" /> Create Bug
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      ) : filteredBugs.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <FaExclamationTriangle className="mx-auto text-4xl text-yellow-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No bugs found</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' 
              ? 'No bugs match your current filters. Try adjusting your search or filters.'
              : 'Start by creating a new bug for your projects.'}
          </p>
          {userRole === 'manager' && !searchTerm && statusFilter === 'all' && priorityFilter === 'all' && (
            <Link 
              to="/manager/bugs/create" 
              className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <FaPlus className="mr-2" /> Create Bug
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bug Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBugs.map((bug) => (
                  <tr 
                    key={bug._id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/manager/bugs/${bug._id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {bug.bug_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {bug.project_id?.project_name || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {bug.developer_id?.username || 'Unassigned'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPriorityBadge(bug.priority)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(bug.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(bug.expected_completion_date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3" onClick={(e) => e.stopPropagation()}>
                        <Link 
                          to={`/manager/bugs/${bug._id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </Link>
                        {userRole === 'manager' && (
                          <>
                            <Link 
                              to={`/manager/bugs/edit/${bug._id}`} 
                              className="text-indigo-600 hover:text-indigo-900"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <FaEdit className="w-4 h-4" />
                            </Link>
                            <button 
                              onClick={(e) => handleDeleteClick(bug._id, e)} 
                              className="text-red-600 hover:text-red-900"
                            >
                              <FaTrash className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <Modal
          title="Delete Bug"
          message="Are you sure you want to delete this bug? This action cannot be undone."
          confirmText="Yes, Delete It"
          cancelText="Cancel"
          onConfirm={handleDeleteConfirm}
          onCancel={handleCloseModal}
          type="error"
          confirmButtonClass="bg-red-600 hover:bg-red-700"
        />
      )}
    </div>
  );
};

export default BugsList; 