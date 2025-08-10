import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiSave, FiX } from 'react-icons/fi';
import taskService from '../../Services/taskService';
import teamService from '../../Services/teamService';
import projectService from '../../Services/projectService';

const EditTask = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [developers, setDevelopers] = useState([]);
  const [formData, setFormData] = useState({
    task_name: '',
    task_description: '',
    expected_completion_date: '',
    priority: '',
    status: '',
    developer_id: ''
  });

  useEffect(() => {
    fetchTaskDetails();
  }, [taskId]);

  const fetchTaskDetails = async () => {
    try {
      setLoading(true);
      const response = await taskService.getTaskById(taskId);
      const task = response.task;
      
      if (!task) {
        toast.error('Task not found');
        navigate('/manager/tasks');
        return;
      }

      // Format date for input
      const date = new Date(task.expected_completion_date);
      const formattedDate = date.toISOString().split('T')[0];

      setFormData({
        task_name: task.task_name,
        task_description: task.task_description,
        expected_completion_date: formattedDate,
        priority: task.priority,
        status: task.status,
        developer_id: task.developer_id._id,
        project_id: task.project_id._id
      });

      // Fetch team developers
      fetchTeamDevelopers(task.project_id._id);
    } catch (error) {
      console.error('Error fetching task details:', error);
      toast.error('Failed to load task details');
      navigate('/manager/tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamDevelopers = async (projectId) => {
    try {
      console.log('Fetching team developers for project:', projectId);
      
      // First, get the project details to extract the team ID
      const projectResponse = await projectService.getProjectById(projectId);
      const project = projectResponse.project;
      
      if (!project || !project.team) {
        console.error('Project not found or has no team assigned');
        toast.error('Failed to load project team information');
        return;
      }
      
      // Extract the team ID
      const teamId = typeof project.team === 'object' ? project.team._id : project.team;
      
      console.log('Using team ID:', teamId);
      
      // Fetch developers for the team
      const developersResponse = await teamService.getTeamDevelopers(teamId);
      setDevelopers(developersResponse.developers || []);
      console.log('Developers loaded:', developersResponse.developers);
    } catch (error) {
      console.error('Error fetching team developers:', error);
      toast.error('Failed to load developers');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      await taskService.updateTask(taskId, formData);
      toast.success('Task updated successfully');
      navigate(`/manager/tasks/${taskId}`);
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error(error.toString() || 'Failed to update task');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Edit Task</h1>
          <button
            onClick={() => navigate(`/manager/tasks/${taskId}`)}
            className="flex items-center px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            <FiX className="mr-2" /> Cancel
          </button>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="task_name">
                Task Name *
              </label>
              <input
                type="text"
                id="task_name"
                name="task_name"
                value={formData.task_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter task name"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="developer_id">
                Assign Developer *
              </label>
              <select
                id="developer_id"
                name="developer_id"
                value={formData.developer_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a Developer</option>
                {developers.map(developer => (
                  <option key={developer._id} value={developer._id}>
                    {developer.username} ({developer.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="task_description">
                Description *
              </label>
              <textarea
                id="task_description"
                name="task_description"
                value={formData.task_description}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Describe the task"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="expected_completion_date">
                Expected Completion Date *
              </label>
              <input
                type="date"
                id="expected_completion_date"
                name="expected_completion_date"
                value={formData.expected_completion_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="priority">
                Priority *
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="status">
                Status *
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <FiSave className="mr-2" /> Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditTask; 