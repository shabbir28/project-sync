import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiX, FiAlertCircle } from 'react-icons/fi';
import projectService from '../../Services/projectService';
import teamService from '../../Services/teamService';
import clientService from '../../Services/clientService';

export default function CreateProject() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [teams, setTeams] = useState([]);
  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState({
    project_name: '',
    client: '',
    team: '',
    tech_stack: '',
    project_link: '',
    documentation_link: '',
    estimated_time: '',
    description: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchTeams();
  }, []);

  // Fetch clients when team changes
  useEffect(() => {
    if (formData.team) {
      fetchTeamClients(formData.team);
    } else {
      setClients([]);
    }
  }, [formData.team]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await teamService.getManagerTeams();
      console.log('Teams response:', response);
      console.log('Teams array:', response.teams);
      setTeams(response.teams);
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast.error('Error fetching teams: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamClients = async (teamId) => {
    try {
      console.log(`Fetching clients for team: ${teamId}`);
      const response = await clientService.getTeamClients(teamId);
      console.log('Clients response:', response);
      setClients(response.clients || []);
      
      // Reset client selection if previous selection is not in the new list
      if (formData.client && !response.clients.some(client => client._id === formData.client)) {
        setFormData(prev => ({ ...prev, client: '' }));
      }
    } catch (error) {
      console.error(`Error fetching clients for team ${teamId}:`, error);
      toast.error('Failed to load clients for the selected team');
      setClients([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
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
    if (!formData.project_name.trim()) {
      newErrors.project_name = 'Project name is required';
    }
    
    if (!formData.client) {
      newErrors.client = 'Client selection is required';
    }
    
    if (!formData.team) {
      newErrors.team = 'Team selection is required';
    } else if (!formData.team.match(/^[0-9a-fA-F]{24}$/)) {
      newErrors.team = 'Invalid team format';
    }
    
    if (!formData.tech_stack.trim()) {
      newErrors.tech_stack = 'Tech stack is required';
    }
    
    if (!formData.estimated_time) {
      newErrors.estimated_time = 'Deadline is required';
    } else {
      const selectedDate = new Date(formData.estimated_time);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.estimated_time = 'Deadline cannot be in the past';
      }
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description should be at least 10 characters';
    }
    
    // URL validation for optional fields
    if (formData.project_link && !isValidUrl(formData.project_link)) {
      newErrors.project_link = 'Please enter a valid URL';
    }
    
    if (formData.documentation_link && !isValidUrl(formData.documentation_link)) {
      newErrors.documentation_link = 'Please enter a valid URL';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please correct the errors in the form');
      return;
    }

    try {
      setSubmitLoading(true);
      console.log('Submitting project data:', formData);
      
      const teamId = formData.team;
      const validData = {
        ...formData,
        team: teamId
      };
      
      console.log('Final data being sent:', validData);
      const response = await projectService.createProject(validData);
      console.log('Project creation response:', response);
      
      if (response && response.status === "SUCCESS") {
        toast.success(response.message || 'Project created successfully');
        navigate('/manager/projects');
      } else {
        console.error('Unexpected response format:', response);
        toast.error('Project creation returned an unexpected response format');
      }
    } catch (error) {
      console.error('Project creation error:', error);
      toast.error('Error creating project: ' + error);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h1 className="text-2xl font-bold uppercase">Add Project</h1>
          <button onClick={() => navigate('/manager/projects')} className="text-gray-500 hover:text-gray-700">
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Project Name *</label>
              <input
                type="text"
                name="project_name"
                value={formData.project_name}
                onChange={handleChange}
                className={`w-full p-3 border ${errors.project_name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 ${errors.project_name ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
                placeholder="Enter Project Name"
              />
              {errors.project_name && (
                <p className="mt-1 text-xs text-red-500 flex items-center">
                  <FiAlertCircle className="mr-1" /> {errors.project_name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Team *</label>
              <select
                name="team"
                value={formData.team}
                onChange={handleChange}
                className={`w-full p-3 border ${errors.team ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 ${errors.team ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
              >
                <option value="">Select a Team</option>
                {teams.map(team => (
                  <option key={team._id} value={team._id}>{team.team_name}</option>
                ))}
              </select>
              {errors.team && (
                <p className="mt-1 text-xs text-red-500 flex items-center">
                  <FiAlertCircle className="mr-1" /> {errors.team}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Client *</label>
              <select
                name="client"
                value={formData.client}
                onChange={handleChange}
                className={`w-full p-3 border ${errors.client ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 ${errors.client ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
                disabled={!formData.team}
              >
                <option value="">Select a Client</option>
                {clients.map(client => (
                  <option key={client._id} value={client._id}>
                    {client.client_name} ({client.client_type})
                  </option>
                ))}
              </select>
              {clients.length === 0 && formData.team && (
                <p className="mt-1 text-xs text-yellow-500 flex items-center">
                  <FiAlertCircle className="mr-1" /> No clients found for this team. <a href="/manager/clients/create" className="ml-1 underline">Create one</a>
                </p>
              )}
              {errors.client && (
                <p className="mt-1 text-xs text-red-500 flex items-center">
                  <FiAlertCircle className="mr-1" /> {errors.client}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tech Stack *</label>
              <input
                type="text"
                name="tech_stack"
                value={formData.tech_stack}
                onChange={handleChange}
                className={`w-full p-3 border ${errors.tech_stack ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 ${errors.tech_stack ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
                placeholder="e.g., React, Node.js, MongoDB"
              />
              {errors.tech_stack && (
                <p className="mt-1 text-xs text-red-500 flex items-center">
                  <FiAlertCircle className="mr-1" /> {errors.tech_stack}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Project Link</label>
              <input
                type="url"
                name="project_link"
                value={formData.project_link}
                onChange={handleChange}
                className={`w-full p-3 border ${errors.project_link ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 ${errors.project_link ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
                placeholder="https://example.com"
              />
              {errors.project_link && (
                <p className="mt-1 text-xs text-red-500 flex items-center">
                  <FiAlertCircle className="mr-1" /> {errors.project_link}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Documentation Link</label>
              <input
                type="url"
                name="documentation_link"
                value={formData.documentation_link}
                onChange={handleChange}
                className={`w-full p-3 border ${errors.documentation_link ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 ${errors.documentation_link ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
                placeholder="https://docs.example.com"
              />
              {errors.documentation_link && (
                <p className="mt-1 text-xs text-red-500 flex items-center">
                  <FiAlertCircle className="mr-1" /> {errors.documentation_link}
                </p>
              )}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Completion Date *</label>
            <input
              type="date"
              name="estimated_time"
              value={formData.estimated_time}
              onChange={handleChange}
              className={`w-full p-3 border ${errors.estimated_time ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 ${errors.estimated_time ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
            />
            {errors.estimated_time && (
              <p className="mt-1 text-xs text-red-500 flex items-center">
                <FiAlertCircle className="mr-1" /> {errors.estimated_time}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={`w-full p-3 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 ${errors.description ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
              rows={4}
              placeholder="Provide a detailed description of the project"
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-500 flex items-center">
                <FiAlertCircle className="mr-1" /> {errors.description}
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/manager/projects')}
              className="px-4 py-2 mr-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
            >
              {submitLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </div>
              ) : (
                'Create Project'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 