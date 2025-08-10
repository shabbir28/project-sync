import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import projectService from '../../Services/projectService';
import teamService from '../../Services/teamService';
import { createBug } from '../../Services/bugService';
import { useAuth } from '../../Services/authContext';
import { FaExclamationCircle } from 'react-icons/fa';

const CreateBug = () => {
  const navigate = useNavigate();
  const { isLoggedIn, userRole } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState({
    projects: false,
    developers: false
  });
  const [errors, setErrors] = useState({
    bug_name: false,
    project_id: false,
    developer_id: false,
    bug_description: false,
    expected_completion_date: false
  });
  const [formData, setFormData] = useState({
    bug_name: '',
    project_id: '',
    developer_id: '',
    bug_description: '',
    expected_completion_date: '',
    priority: 'medium',
    status: 'active'
  });

  // Fetch projects on component mount
  useEffect(() => {
    if (!isLoggedIn || userRole !== 'manager') {
      navigate('/login');
      return;
    }

    const fetchProjects = async () => {
      setLoading(prev => ({ ...prev, projects: true }));
      try {
        const response = await projectService.getAllProjects();
        if (response.status === 'SUCCESS') {
          setProjects(response.projects || []);
        } else {
          toast.error(response.message || 'Failed to fetch projects');
        }
      } catch (error) {
        toast.error('Failed to fetch projects');
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(prev => ({ ...prev, projects: false }));
      }
    };

    fetchProjects();
  }, [isLoggedIn, userRole, navigate]);

  // When a project is selected, fetch developers for that project
  useEffect(() => {
    if (!selectedProjectId) {
      setDevelopers([]);
      return;
    }

    const fetchProjectDevelopers = async () => {
      setLoading(prev => ({ ...prev, developers: true }));
      try {
        // Find the selected project
        const selectedProject = projects.find(project => project._id === selectedProjectId);
        
        if (selectedProject && selectedProject.team && selectedProject.team._id) {
          // Fetch developers for the team
          const response = await teamService.getTeamDevelopers(selectedProject.team._id);
          if (response.status === 'SUCCESS') {
            setDevelopers(response.developers || []);
            if (response.developers?.length === 0) {
              toast.info('This project team has no developers.');
            }
          } else {
            toast.error(response.message || 'Failed to fetch developers');
            setDevelopers([]);
          }
        } else {
          toast.warning('Selected project has no team assigned.');
          setDevelopers([]);
        }
      } catch (error) {
        toast.error('Error fetching developers');
        console.error('Error fetching team developers:', error);
        setDevelopers([]);
      } finally {
        setLoading(prev => ({ ...prev, developers: false }));
      }
    };

    fetchProjectDevelopers();
  }, [selectedProjectId, projects]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'project_id') {
      setSelectedProjectId(value);
      // Reset developer when project changes
      setFormData(prev => ({
        ...prev,
        project_id: value,
        developer_id: ''
      }));
      // Clear error if field is filled
      if (value) {
        setErrors(prev => ({ ...prev, project_id: false }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      
      // Clear error if field is filled
      if (value) {
        setErrors(prev => ({ ...prev, [name]: false }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {
      bug_name: !formData.bug_name.trim(),
      project_id: !formData.project_id,
      developer_id: !formData.developer_id,
      bug_description: !formData.bug_description.trim(),
      expected_completion_date: !formData.expected_completion_date
    };
    
    setErrors(newErrors);
    
    // Return true if form is valid (no errors)
    return !Object.values(newErrors).some(error => error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data
    if (!validateForm()) {
      toast.error('Please fill in all required fields correctly');
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await createBug(formData);
      
      if (response.status === 'SUCCESS') {
        toast.success('Bug created successfully');
        navigate('/manager/bugs');
      } else {
        toast.error(response.message || 'Failed to create bug');
      }
    } catch (error) {
      toast.error(error.toString() || 'Failed to create bug');
      console.error('Error creating bug:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get input classes based on error state
  const getInputClasses = (fieldName) => {
    const baseClasses = "mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500";
    return errors[fieldName] 
      ? `${baseClasses} border-red-500` 
      : `${baseClasses} border-gray-300`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Create New Bug</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Bug Name */}
          <div>
            <label htmlFor="bug_name" className="block text-sm font-medium text-gray-700">
              Bug Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="bug_name"
              name="bug_name"
              value={formData.bug_name}
              onChange={handleChange}
              className={getInputClasses('bug_name')}
              required
            />
            {errors.bug_name && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <FaExclamationCircle className="mr-1" />
                Bug name is required
              </p>
            )}
          </div>

          {/* Project Selection */}
          <div>
            <label htmlFor="project_id" className="block text-sm font-medium text-gray-700">
              Project <span className="text-red-500">*</span>
            </label>
            <select
              id="project_id"
              name="project_id"
              value={formData.project_id}
              onChange={handleChange}
              className={getInputClasses('project_id')}
              required
              disabled={loading.projects}
            >
              <option value="">Select a project</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.project_name}
                </option>
              ))}
            </select>
            {errors.project_id && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <FaExclamationCircle className="mr-1" />
                Project selection is required
              </p>
            )}
            {loading.projects && (
              <p className="mt-1 text-sm text-gray-500">Loading projects...</p>
            )}
          </div>

          {/* Developer Selection */}
          <div>
            <label htmlFor="developer_id" className="block text-sm font-medium text-gray-700">
              Assign To Developer <span className="text-red-500">*</span>
            </label>
            <select
              id="developer_id"
              name="developer_id"
              value={formData.developer_id}
              onChange={handleChange}
              className={getInputClasses('developer_id')}
              required
              disabled={!selectedProjectId || loading.developers}
            >
              <option value="">Select a developer</option>
              {developers.map((developer) => (
                <option key={developer._id} value={developer._id}>
                  {developer.username}
                </option>
              ))}
            </select>
            {errors.developer_id && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <FaExclamationCircle className="mr-1" />
                Developer selection is required
              </p>
            )}
            {!selectedProjectId && !errors.project_id && (
              <p className="mt-1 text-sm text-gray-500">Select a project first</p>
            )}
            {selectedProjectId && loading.developers && (
              <p className="mt-1 text-sm text-gray-500">Loading developers...</p>
            )}
            {selectedProjectId && !loading.developers && developers.length === 0 && (
              <p className="mt-1 text-sm text-yellow-600 flex items-center">
                <FaExclamationCircle className="mr-1" />
                No developers available for this project team
              </p>
            )}
          </div>

          {/* Bug Description */}
          <div>
            <label htmlFor="bug_description" className="block text-sm font-medium text-gray-700">
              Bug Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="bug_description"
              name="bug_description"
              value={formData.bug_description}
              onChange={handleChange}
              rows={4}
              className={getInputClasses('bug_description')}
              required
            />
            {errors.bug_description && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <FaExclamationCircle className="mr-1" />
                Bug description is required
              </p>
            )}
          </div>

          {/* Expected Completion Date */}
          <div>
            <label htmlFor="expected_completion_date" className="block text-sm font-medium text-gray-700">
              Expected Completion Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="expected_completion_date"
              name="expected_completion_date"
              value={formData.expected_completion_date}
              onChange={handleChange}
              className={getInputClasses('expected_completion_date')}
              required
              min={new Date().toISOString().split('T')[0]} // Set min date to today
            />
            {errors.expected_completion_date && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <FaExclamationCircle className="mr-1" />
                Expected completion date is required
              </p>
            )}
          </div>

          {/* Priority */}
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/manager/bugs')}
              className="mr-4 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Bug'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBug; 