import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiX, FiAlertCircle, FiSave } from 'react-icons/fi';
import clientService from '../../Services/clientService';
import teamService from '../../Services/teamService';

const CreateClient = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [teams, setTeams] = useState([]);
  const [formData, setFormData] = useState({
    team: '',
    client_name: '',
    client_type: 'Local',
    client_description: '',
    source: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await teamService.getManagerTeams();
      setTeams(response.teams || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast.error('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
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
    if (!formData.team) {
      newErrors.team = 'Team selection is required';
    }
    
    if (!formData.client_name.trim()) {
      newErrors.client_name = 'Client name is required';
    }
    
    if (!formData.client_description.trim()) {
      newErrors.client_description = 'Description is required';
    } else if (formData.client_description.trim().length < 10) {
      newErrors.client_description = 'Description should be at least 10 characters';
    }
    
    if (!formData.source.trim()) {
      newErrors.source = 'Source is required';
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
      await clientService.createClient(formData);
      toast.success('Client created successfully');
      navigate('/manager/clients');
    } catch (error) {
      console.error('Error creating client:', error);
      toast.error(error.toString() || 'Failed to create client');
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
          <h1 className="text-2xl font-bold uppercase">Add New Client</h1>
          <button 
            onClick={() => navigate('/manager/clients')} 
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                  <option key={team._id} value={team._id}>
                    {team.team_name}
                  </option>
                ))}
              </select>
              {errors.team && (
                <p className="mt-1 text-xs text-red-500 flex items-center">
                  <FiAlertCircle className="mr-1" /> {errors.team}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Client Type *</label>
              <select
                name="client_type"
                value={formData.client_type}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Local">Local</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Client Name *</label>
            <input
              type="text"
              name="client_name"
              value={formData.client_name}
              onChange={handleChange}
              placeholder="Enter client name"
              className={`w-full p-3 border ${errors.client_name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 ${errors.client_name ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
            />
            {errors.client_name && (
              <p className="mt-1 text-xs text-red-500 flex items-center">
                <FiAlertCircle className="mr-1" /> {errors.client_name}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Source *</label>
            <input
              type="text"
              name="source"
              value={formData.source}
              onChange={handleChange}
              placeholder="e.g., Solo, Personal, Fiverr, Replit"
              className={`w-full p-3 border ${errors.source ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 ${errors.source ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
            />
            {errors.source && (
              <p className="mt-1 text-xs text-red-500 flex items-center">
                <FiAlertCircle className="mr-1" /> {errors.source}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
            <textarea
              name="client_description"
              value={formData.client_description}
              onChange={handleChange}
              placeholder="Provide a description of the client"
              rows={4}
              className={`w-full p-3 border ${errors.client_description ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 ${errors.client_description ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
            />
            {errors.client_description && (
              <p className="mt-1 text-xs text-red-500 flex items-center">
                <FiAlertCircle className="mr-1" /> {errors.client_description}
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/manager/clients')}
              className="px-4 py-2 mr-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
            >
              {submitting ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <FiSave className="mr-2" /> Create Client
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateClient; 