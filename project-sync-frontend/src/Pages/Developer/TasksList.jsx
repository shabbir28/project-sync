import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiEye, FiCheck, FiFilter, FiRefreshCw, FiCheckSquare } from 'react-icons/fi';
import taskService from '../../Services/taskService';

const DeveloperTasksList = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await taskService.getAllTasks();
      setTasks(response.tasks || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsCompleted = async (taskId) => {
    try {
      await taskService.markTaskAsCompleted(taskId);
      toast.success('Task marked as completed');
      fetchTasks(); // Refresh the list
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
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

  // Filter tasks based on selected criteria
  const filteredTasks = tasks.filter(task => {
    const statusMatch = filterStatus === 'all' || task.status === filterStatus;
    const priorityMatch = filterPriority === 'all' || task.priority === filterPriority;
    return statusMatch && priorityMatch;
  });

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Manage Your Tasks</h2>
            <p className="mt-1 text-sm text-gray-500">View and complete tasks assigned to you.</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-2">Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-2">Priority:</span>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="rounded border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            
            <button
              onClick={fetchTasks}
              className="inline-flex items-center rounded border border-gray-300 bg-white px-2.5 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <FiRefreshCw className="mr-1.5 h-4 w-4 text-gray-500" />
              Refresh
            </button>
          </div>
        </div>
        
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center">
            <div className="p-3 bg-indigo-50 rounded-full inline-flex mx-auto mb-4">
              <FiCheckSquare className="h-8 w-8 text-indigo-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No tasks found</h3>
            <p className="mt-2 text-gray-500 max-w-md mx-auto">
              No tasks match your current filter criteria. Adjust your filters to see more tasks.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            <div className="grid grid-cols-12 gap-4 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 border-b border-gray-200 bg-gray-50">
              <div className="col-span-3">Task</div>
              <div className="col-span-3">Project</div>
              <div className="col-span-2">Due Date</div>
              <div className="col-span-1">Priority</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
            
            {filteredTasks.map((task) => (
              <div key={task._id} className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50">
                <div className="col-span-3 flex items-center">
                  <div className="p-2 bg-indigo-50 rounded-full mr-3">
                    <FiCheckSquare className="h-5 w-5 text-indigo-500" />
                  </div>
                  <div className="font-medium text-gray-900">
                    {task.task_name}
                  </div>
                </div>
                <div className="col-span-3 text-sm text-gray-500">
                  {task.project_id?.project_name || 'N/A'}
                </div>
                <div className="col-span-2 text-sm text-gray-500">
                  {new Date(task.expected_completion_date).toLocaleDateString()}
                </div>
                <div className="col-span-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </span>
                </div>
                <div className="col-span-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                    {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                  </span>
                </div>
                <div className="col-span-2 text-right">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => navigate(`/developer/tasks/${task._id}`)}
                      className="rounded p-1.5 bg-gray-50 text-blue-600 hover:bg-blue-50 border border-gray-200 transition-colors"
                      title="View Details"
                    >
                      <FiEye className="h-4 w-4" />
                    </button>
                    {task.status === 'active' && (
                      <button
                        onClick={() => handleMarkAsCompleted(task._id)}
                        className="rounded p-1.5 bg-gray-50 text-green-600 hover:bg-green-50 border border-gray-200 transition-colors"
                        title="Mark as Completed"
                      >
                        <FiCheck className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeveloperTasksList; 