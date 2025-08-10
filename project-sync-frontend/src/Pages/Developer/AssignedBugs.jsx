import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getAssignedBugs, updateBugStatus } from '../../Services/bugService';
import { useAuth } from '../../Services/authContext';
import { FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const AssignedBugs = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [bugs, setBugs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCompleteConfirmation, setShowCompleteConfirmation] = useState(false);
  const [selectedBugId, setSelectedBugId] = useState(null);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    fetchAssignedBugs();
  }, [isLoggedIn, navigate]);

  const fetchAssignedBugs = async () => {
    setIsLoading(true);
    try {
      const response = await getAssignedBugs();
      if (response.status === 'SUCCESS') {
        setBugs(response.bugs || []);
      } else {
        toast.error(response.message || 'Failed to fetch assigned bugs');
      }
    } catch (error) {
      toast.error('Error fetching assigned bugs');
      console.error('Error fetching assigned bugs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsComplete = (bugId) => {
    setSelectedBugId(bugId);
    setShowCompleteConfirmation(true);
  };

  const handleCompleteConfirm = async () => {
    try {
      const response = await updateBugStatus(selectedBugId, 'completed');
      if (response.status === 'SUCCESS') {
        toast.success('Bug marked as completed');
        fetchAssignedBugs();
      } else {
        toast.error(response.message || 'Failed to update bug status');
      }
    } catch (error) {
      toast.error('Error updating bug status');
      console.error('Error updating bug status:', error);
    } finally {
      setShowCompleteConfirmation(false);
      setSelectedBugId(null);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusBadge = (status) => {
    return status === 'active' 
      ? <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Active</span>
      : <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Completed</span>;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Calculate if a bug is past due date
  const isPastDue = (dateString) => {
    const dueDate = new Date(dateString);
    const today = new Date();
    return dueDate < today && dueDate.toDateString() !== today.toDateString();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Assigned Bugs</h2>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="spinner"></div>
          <p className="mt-2 text-gray-600">Loading bugs...</p>
        </div>
      ) : bugs.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <FaExclamationTriangle className="mx-auto text-4xl text-yellow-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No bugs assigned</h3>
          <p className="text-gray-600">
            You don't have any bugs assigned to you at the moment.
          </p>
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
                {bugs.map((bug) => (
                  <tr key={bug._id} className={`hover:bg-gray-50 ${isPastDue(bug.expected_completion_date) && bug.status === 'active' ? 'bg-red-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {bug.bug_name}
                      </div>
                      {isPastDue(bug.expected_completion_date) && bug.status === 'active' && (
                        <div className="text-xs text-red-600 font-medium mt-1">
                          Past due date!
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {bug.project?.project_name || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${getPriorityColor(bug.priority)}`}>
                        {bug.priority.charAt(0).toUpperCase() + bug.priority.slice(1)}
                      </div>
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
                      <div className="flex items-center space-x-3">
                        <button 
                          onClick={() => navigate(`/developer/bugs/${bug._id}`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Details
                        </button>
                        {bug.status === 'active' && (
                          <button 
                            onClick={() => handleMarkAsComplete(bug._id)} 
                            className="text-green-600 hover:text-green-900 flex items-center"
                          >
                            <FaCheckCircle className="mr-1" /> Mark Complete
                          </button>
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

      {/* Complete Confirmation Modal */}
      {showCompleteConfirmation && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                    <FaCheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Mark Bug as Completed
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to mark this bug as completed? This will update the status in the system.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleCompleteConfirm}
                >
                  Mark Complete
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowCompleteConfirmation(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignedBugs; 