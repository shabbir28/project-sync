import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

/**
 * Reusable form component for creating and editing teams
 */
const TeamForm = ({ 
  initialData = { 
    team_name: '', 
    team_designation: '', 
    purpose: ''
  }, 
  onSubmit, 
  isSubmitting = false, 
  buttonText = 'Save',
  submitButtonText = 'Saving...',
  cancelPath = '/manager/teams',
  onCancel
}) => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Update form data when initialData changes (for edit form)
  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    
    // Mark field as touched
    if (!touched[name]) {
      setTouched((prevTouched) => ({
        ...prevTouched,
        [name]: true
      }));
    }
    
    // Clear error when user types
    if (errors[name]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: '',
      }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prevTouched) => ({
      ...prevTouched,
      [name]: true
    }));
    validateField(name, formData[name]);
  };

  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'team_name':
        if (!value.trim()) {
          error = 'Team name is required';
        } else if (value.length < 2) {
          error = 'Team name must be at least 2 characters';
        } else if (value.length > 50) {
          error = 'Team name must be less than 50 characters';
        }
        break;
        
      case 'team_designation':
        if (!value.trim()) {
          error = 'Team designation is required';
        } else if (value.length < 2) {
          error = 'Team designation must be at least 2 characters';
        } else if (value.length > 100) {
          error = 'Team designation must be less than 100 characters';
        }
        break;
        
      case 'purpose':
        if (!value.trim()) {
          error = 'Team purpose is required';
        } else if (value.length < 10) {
          error = 'Purpose should be at least 10 characters';
        } else if (value.length > 500) {
          error = 'Purpose should be less than 500 characters';
        }
        break;
        
      default:
        break;
    }
    
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: error
    }));
    
    return !error;
  };

  const validateForm = () => {
    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);
    
    // Validate all fields
    const fieldValidations = Object.keys(formData).map(key => 
      validateField(key, formData[key])
    );
    
    return fieldValidations.every(isValid => isValid);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Add status as Active by default
      onSubmit({...formData, status: 'Active'});
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 md:p-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {buttonText === 'Create Team' ? 'Create New Team' : 'Update Team'}
        </h2>
        <p className="text-gray-600 mb-8">
          {buttonText === 'Create Team' ? 'Create a new team to manage projects and collaborate with team members.' : 'Update team information and settings.'}
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Team Name */}
            <div>
              <label htmlFor="team_name" className="block text-sm font-medium text-gray-700 mb-1">
                Team Name <span className="text-red-500">*</span>
              </label>
              <input
                id="team_name"
                name="team_name"
                type="text"
                value={formData.team_name}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`block w-full px-4 py-3 rounded-md border ${
                  errors.team_name && touched.team_name 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                } shadow-sm text-gray-900 text-base`}
                placeholder="Enter team name (e.g. Frontend Development Team)"
              />
              {errors.team_name && touched.team_name && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.team_name}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Choose a clear, specific name that reflects the team's focus.
              </p>
            </div>

            {/* Team Designation */}
            <div>
              <label htmlFor="team_designation" className="block text-sm font-medium text-gray-700 mb-1">
                Team Designation/Department <span className="text-red-500">*</span>
              </label>
              <input
                id="team_designation"
                name="team_designation"
                type="text"
                value={formData.team_designation}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`block w-full px-4 py-3 rounded-md border ${
                  errors.team_designation && touched.team_designation 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                } shadow-sm text-gray-900 text-base`}
                placeholder="Enter team designation (e.g. Engineering, Design, Marketing)"
              />
              {errors.team_designation && touched.team_designation && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.team_designation}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Specify the department or function of this team.
              </p>
            </div>

            {/* Team Purpose */}
            <div>
              <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-1">
                Team Purpose <span className="text-red-500">*</span>
              </label>
              <textarea
                id="purpose"
                name="purpose"
                rows={4}
                value={formData.purpose}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`block w-full px-4 py-3 rounded-md border ${
                  errors.purpose && touched.purpose 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                } shadow-sm text-gray-900 text-base`}
                placeholder="Describe the team's purpose, goals, and responsibilities"
              />
              {errors.purpose && touched.purpose && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.purpose}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Clearly define the team's purpose and objectives (minimum 10 characters).
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-10 flex justify-end gap-4 border-t border-gray-200 pt-6">
            {onCancel ? (
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
            ) : (
              <Link
                to={cancelPath}
                className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </Link>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? submitButtonText : buttonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeamForm; 