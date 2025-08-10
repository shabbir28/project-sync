import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiCheck, FiEdit2 } from 'react-icons/fi';
import taskService from '../Services/taskService';
import { useAuth } from '../Services/authContext';

const TaskDetail = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchTaskDetails();
  }, [taskId]);

  const fetchTaskDetails = async () => {
    try {
      setLoading(true);
      const response = await taskService.getTaskById(taskId);
      setTask(response.task);
    } catch (error) {
      console.error('Error fetching task details:', error);
      toast.error('Failed to load task details');
      // Navigate back on error
      navigate(userRole === 'manager' ? '/manager/tasks' : '/developer/tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsCompleted = async () => {
    try {
      setUpdating(true);
      await taskService.markTaskAsCompleted(taskId);
      toast.success('Task marked as completed');
      fetchTaskDetails(); // Refresh the task details
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    } finally {
      setUpdating(false);
    }
  };

  // Priority badge color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-800">Task not found</h2>
        <p className="mt-2 text-gray-600">
          The task you are looking for does not exist or you don't have permission to view it.
        </p>
        <Link
          to={userRole === 'manager' ? '/manager/tasks' : '/developer/tasks'}
          className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <FiArrowLeft className="mr-2" /> Back to Tasks
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            to={userRole === 'manager' ? '/manager/tasks' : '/developer/tasks'}
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <FiArrowLeft className="mr-2" /> Back to Tasks
          </Link>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-800">{task.task_name}</h1>
              <div className="flex space-x-2">
                {userRole === 'manager' && (
                  <button
                    onClick={() => navigate(`/manager/tasks/edit/${taskId}`)}
                    className="inline-flex items-center px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                  >
                    <FiEdit2 className="mr-1" /> Edit
                  </button>
                )}
                {userRole === 'developer' && task.status === 'active' && (
                  <button
                    onClick={handleMarkAsCompleted}
                    disabled={updating}
                    className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-800 rounded hover:bg-green-200 disabled:opacity-50"
                  >
                    {updating ? (
                      <div className="animate-spin h-4 w-4 mr-1 border-b-2 border-green-800"></div>
                    ) : (
                      <FiCheck className="mr-1" />
                    )}
                    Mark as Completed
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-4">Task Information</h2>
                
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-500">Project</p>
                  <p className="text-base">{task.project_id?.project_name || 'N/A'}</p>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-500">Assigned To</p>
                  <p className="text-base">
                    {task.developer_id?.username || 'N/A'} 
                    {task.developer_id?.email && `(${task.developer_id.email})`}
                  </p>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(task.status)}`}>
                    {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-500">Priority</p>
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </span>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-4">Dates</h2>
                
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-500">Expected Completion Date</p>
                  <p className="text-base">{new Date(task.expected_completion_date).toLocaleDateString()}</p>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-500">Created On</p>
                  <p className="text-base">{new Date(task.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Description</h2>
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-sm whitespace-pre-line">{task.task_description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail; 