import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiX, FiAlertCircle, FiSave } from 'react-icons/fi';
import taskService from '../../Services/taskService';
import projectService from '../../Services/projectService';
import teamService from '../../Services/teamService';

const CreateTask = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [projects, setProjects] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [formData, setFormData] = useState({
    project_id: '',
    developer_id: '',
    task_name: '',
    task_description: '',
    expected_completion_date: '',
    priority: 'medium'
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchTeamDevelopers(selectedProject);
    } else {
      setDevelopers([]);
      setFormData(prev => ({ ...prev, developer_id: '' }));
    }
  }, [selectedProject]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectService.getAllProjects();
      const projectsData = response.projects || [];
      
      // Log projects data for debugging
      console.log('Projects data:', projectsData);
      projectsData.forEach(project => {
        console.log(`Project: ${project.project_name}, Team: ${typeof project.team === 'object' ? JSON.stringify(project.team) : project.team}`);
      });
      
      // Make sure projects have properly formatted team IDs
      const sanitizedProjects = projectsData.map(project => {
        // If team is an object with _id, extract it
        if (project.team && typeof project.team === 'object' && project.team._id) {
          return {
            ...project,
            teamId: project.team._id, // Store the ID separately for easier access
            teamName: project.team.team_name || 'Unknown Team'
          };
        } 
        // If team is a string (ID), keep it as is
        else if (project.team && typeof project.team === 'string') {
          return {
            ...project,
            teamId: project.team,
            teamName: 'Unknown Team'
          };
        }
        // Invalid or missing team
        else {
          return {
            ...project,
            teamId: null,
            teamName: 'No Team'
          };
        }
      });
      
      setProjects(sanitizedProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamDevelopers = async (projectId) => {
    try {
      const selectedProject = projects.find(p => p._id === projectId);
      
      if (!selectedProject) {
        console.error(`Project with ID ${projectId} not found`);
        setDevelopers([]);
        return;
      }
      
      // Use the extracted teamId from the sanitized project object
      const teamId = selectedProject.teamId;
      
      if (!teamId) {
        console.error(`Project ${selectedProject.project_name} has no valid team assigned`);
        setDevelopers([]);
        return;
      }
      
      // Debug the team ID
      console.log('Using team ID:', teamId);
      console.log('Team ID type:', typeof teamId);
      
      // Validate teamId format
      if (!teamId || typeof teamId !== 'string' || !teamId.match(/^[0-9a-fA-F]{24}$/)) {
        console.error('Invalid team ID format:', teamId);
        toast.error('Invalid team ID format. Please contact support.');
        setDevelopers([]);
        return;
      }

      console.log('Fetching developers for team:', teamId);
      
      const response = await teamService.getTeamDevelopers(teamId);
      console.log('Developers response:', response);
      setDevelopers(response.developers || []);
    } catch (error) {
      console.error('Error fetching team developers:', error);
      toast.error('Failed to load developers: ' + (error.message || 'Unknown error'));
      setDevelopers([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'project_id' && value !== formData.project_id) {
      setSelectedProject(value);
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is changed
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required field validation
    if (!formData.project_id) {
      newErrors.project_id = 'Project selection is required';
    }
    
    if (!formData.developer_id) {
      newErrors.developer_id = 'Developer selection is required';
    }
    
    if (!formData.task_name.trim()) {
      newErrors.task_name = 'Task name is required';
    }
    
    if (!formData.task_description.trim()) {
      newErrors.task_description = 'Description is required';
    } else if (formData.task_description.trim().length < 10) {
      newErrors.task_description = 'Description should be at least 10 characters';
    }
    
    if (!formData.expected_completion_date) {
      newErrors.expected_completion_date = 'Completion date is required';
    } else {
      const selectedDate = new Date(formData.expected_completion_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.expected_completion_date = 'Completion date cannot be in the past';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please correct the errors in the form');
      return;
    }
    
    try {
      setSubmitting(true);
      await taskService.createTask(formData);
      toast.success('Task created successfully');
      navigate('/manager/tasks');
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error(error.toString() || 'Failed to create task');
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
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h1 className="text-2xl font-bold uppercase">Create New Task</h1>
          <button 
            onClick={() => navigate('/manager/tasks')} 
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Project *</label>
              <select
                name="project_id"
                value={formData.project_id}
                onChange={handleChange}
                className={`w-full p-3 border ${errors.project_id ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 ${errors.project_id ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
              >
                <option value="">Select a Project</option>
                {projects.map(project => (
                  <option key={project._id} value={project._id}>
                    {project.project_name}
                  </option>
                ))}
              </select>
              {errors.project_id && (
                <p className="mt-1 text-xs text-red-500 flex items-center">
                  <FiAlertCircle className="mr-1" /> {errors.project_id}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Assign Developer *</label>
              <select
                name="developer_id"
                value={formData.developer_id}
                onChange={handleChange}
                className={`w-full p-3 border ${errors.developer_id ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 ${errors.developer_id ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
                disabled={!selectedProject}
              >
                <option value="">Select a Developer</option>
                {developers.map(developer => (
                  <option key={developer._id} value={developer._id}>
                    {developer.username} ({developer.email})
                  </option>
                ))}
              </select>
              {errors.developer_id && (
                <p className="mt-1 text-xs text-red-500 flex items-center">
                  <FiAlertCircle className="mr-1" /> {errors.developer_id}
                </p>
              )}
              {!selectedProject && !errors.developer_id && (
                <p className="mt-1 text-xs text-gray-500">Select a project first to see available developers</p>
              )}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Task Name *</label>
            <input
              type="text"
              name="task_name"
              value={formData.task_name}
              onChange={handleChange}
              className={`w-full p-3 border ${errors.task_name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 ${errors.task_name ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
              placeholder="Enter task name"
            />
            {errors.task_name && (
              <p className="mt-1 text-xs text-red-500 flex items-center">
                <FiAlertCircle className="mr-1" /> {errors.task_name}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Expected Completion Date *</label>
              <input
                type="date"
                name="expected_completion_date"
                value={formData.expected_completion_date}
                onChange={handleChange}
                className={`w-full p-3 border ${errors.expected_completion_date ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 ${errors.expected_completion_date ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
              />
              {errors.expected_completion_date && (
                <p className="mt-1 text-xs text-red-500 flex items-center">
                  <FiAlertCircle className="mr-1" /> {errors.expected_completion_date}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority *</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className={`w-full p-3 border ${errors.priority ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 ${errors.priority ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              {errors.priority && (
                <p className="mt-1 text-xs text-red-500 flex items-center">
                  <FiAlertCircle className="mr-1" /> {errors.priority}
                </p>
              )}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
            <textarea
              name="task_description"
              value={formData.task_description}
              onChange={handleChange}
              className={`w-full p-3 border ${errors.task_description ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 ${errors.task_description ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
              rows={4}
              placeholder="Describe the task"
            />
            {errors.task_description && (
              <p className="mt-1 text-xs text-red-500 flex items-center">
                <FiAlertCircle className="mr-1" /> {errors.task_description}
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 flex items-center"
            >
              {submitting ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <FiSave className="mr-2" /> Create Task
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTask; 