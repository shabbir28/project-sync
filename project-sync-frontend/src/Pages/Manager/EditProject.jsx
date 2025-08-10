import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import { toast } from 'react-toastify';
import projectService from '../../Services/projectService';
import teamService from '../../Services/teamService';

export default function EditProject() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [teams, setTeams] = useState([]);
  const [formData, setFormData] = useState({
    team: '',
    project_name: '',
    client: '',
    tech_stack: '',
    project_link: '',
    documentation_link: '',
    estimated_time: '',
    description: '',
    status: 'Active'
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch project details
        const projectResponse = await projectService.getProjectById(id);
        
        if (projectResponse && projectResponse.status === 'SUCCESS' && projectResponse.project) {
          const project = projectResponse.project;
          // Convert date to YYYY-MM-DD format for input field
          const estimatedDate = new Date(project.estimated_time);
          const formattedDate = estimatedDate.toISOString().split('T')[0];
          
          setFormData({
            team: project.team._id,
            project_name: project.project_name,
            client: project.client,
            tech_stack: project.tech_stack,
            project_link: project.project_link || '',
            documentation_link: project.documentation_link || '',
            estimated_time: formattedDate,
            description: project.description,
            status: project.status
          });
        } else {
          toast.error('Error: Failed to fetch project details');
          navigate('/manager/projects');
          return;
        }
        
        // Fetch teams
        const teamsResponse = await teamService.getManagerTeams();
        if (teamsResponse && teamsResponse.teams) {
          setTeams(teamsResponse.teams);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Error: ' + error);
        navigate('/manager/projects');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when field is changed
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.project_name.trim()) newErrors.project_name = 'Project name is required';
    if (!formData.client.trim()) newErrors.client = 'Client name is required';
    if (!formData.tech_stack.trim()) newErrors.tech_stack = 'Tech stack is required';
    if (!formData.estimated_time) newErrors.estimated_time = 'Deadline is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.team) newErrors.team = 'Team is required';
    
    // Validate URLs if provided
    if (formData.project_link && !isValidUrl(formData.project_link)) {
      newErrors.project_link = 'Please enter a valid URL';
    }
    if (formData.documentation_link && !isValidUrl(formData.documentation_link)) {
      newErrors.documentation_link = 'Please enter a valid URL';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please correct the errors in the form');
      return;
    }
    
    setSubmitting(true);
    
    try {
      await projectService.updateProject(id, formData);
      toast.success('Project updated successfully');
      navigate(`/manager/projects/${id}`);
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Failed to update project: ' + error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          to={`/manager/projects/${id}`}
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          <FiArrowLeft className="mr-2" /> Back to Project
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold">Edit Project</h1>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="project_name" className="block text-sm font-medium text-gray-700 mb-1">
                Project Name *
              </label>
              <input
                type="text"
                id="project_name"
                name="project_name"
                value={formData.project_name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.project_name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              />
              {errors.project_name && <p className="mt-1 text-xs text-red-500">{errors.project_name}</p>}
            </div>

            <div>
              <label htmlFor="client" className="block text-sm font-medium text-gray-700 mb-1">
                Client *
              </label>
              <input
                type="text"
                id="client"
                name="client"
                value={formData.client}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.client ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              />
              {errors.client && <p className="mt-1 text-xs text-red-500">{errors.client}</p>}
            </div>

            <div>
              <label htmlFor="team" className="block text-sm font-medium text-gray-700 mb-1">
                Team *
              </label>
              <select
                id="team"
                name="team"
                value={formData.team}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.team ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              >
                <option value="">Select Team</option>
                {teams.map((team) => (
                  <option key={team._id} value={team._id}>
                    {team.team_name}
                  </option>
                ))}
              </select>
              {errors.team && <p className="mt-1 text-xs text-red-500">{errors.team}</p>}
            </div>

            <div>
              <label htmlFor="tech_stack" className="block text-sm font-medium text-gray-700 mb-1">
                Tech Stack *
              </label>
              <input
                type="text"
                id="tech_stack"
                name="tech_stack"
                value={formData.tech_stack}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.tech_stack ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              />
              {errors.tech_stack && <p className="mt-1 text-xs text-red-500">{errors.tech_stack}</p>}
            </div>

            <div>
              <label htmlFor="project_link" className="block text-sm font-medium text-gray-700 mb-1">
                Project Link
              </label>
              <input
                type="url"
                id="project_link"
                name="project_link"
                value={formData.project_link}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.project_link ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              />
              {errors.project_link && <p className="mt-1 text-xs text-red-500">{errors.project_link}</p>}
            </div>

            <div>
              <label htmlFor="documentation_link" className="block text-sm font-medium text-gray-700 mb-1">
                Documentation Link
              </label>
              <input
                type="url"
                id="documentation_link"
                name="documentation_link"
                value={formData.documentation_link}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.documentation_link ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              />
              {errors.documentation_link && <p className="mt-1 text-xs text-red-500">{errors.documentation_link}</p>}
            </div>

            <div>
              <label htmlFor="estimated_time" className="block text-sm font-medium text-gray-700 mb-1">
                Deadline *
              </label>
              <input
                type="date"
                id="estimated_time"
                name="estimated_time"
                value={formData.estimated_time}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.estimated_time ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              />
              {errors.estimated_time && <p className="mt-1 text-xs text-red-500">{errors.estimated_time}</p>}
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>
          </div>

          <div className="mt-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="6"
              className={`w-full px-3 py-2 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            ></textarea>
            {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
          </div>

          <div className="mt-8 flex justify-end space-x-3">
            <Link
              to={`/manager/projects/${id}`}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
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
  );
} 