import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../../Services/authContext';
import teamService from '../../Services/teamService';
import { toast } from 'react-toastify';
import TeamForm from '../../Components/Forms/TeamForm';

/**
 * CreateTeam component for managers to create a new team
 */
const CreateTeam = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initial form data
  const initialTeamData = {
    team_name: '',
    team_designation: '',
    purpose: '',
    status: 'Active',
  };

  /**
   * Handle form submission to create a new team
   * @param {Object} formData - The team data from the form
   */
  const handleCreateTeam = async (formData) => {
    setIsSubmitting(true);

    try {
      const response = await teamService.createTeam(formData);
      toast.success('Team created successfully!');
      navigate('/manager/teams');
    } catch (error) {
      console.error('Error creating team:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create team';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Link
            to="/manager/teams"
            className="mr-3 rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
            aria-label="Back to teams"
          >
            <FiArrowLeft className="h-5 w-5" aria-hidden="true" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Create New Team</h1>
        </div>
      </div>

      {/* Team Form */}
      <TeamForm 
        initialData={initialTeamData}
        onSubmit={handleCreateTeam}
        isSubmitting={isSubmitting}
        buttonText="Create Team"
        submitButtonText="Creating..."
      />
    </div>
  );
};

export default CreateTeam; 