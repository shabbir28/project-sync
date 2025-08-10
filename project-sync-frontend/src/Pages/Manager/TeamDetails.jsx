import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiEdit2, FiUsers, FiPlus, FiSend, FiMail } from 'react-icons/fi';
import { useAuth } from '../../Services/authContext';
import teamService from '../../Services/teamService';
import invitationService from '../../Services/invitationService';
import { toast } from 'react-toastify';
import TeamForm from '../../Components/Forms/TeamForm';

const TeamDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [invitations, setInvitations] = useState([]);
  const [loadingInvitations, setLoadingInvitations] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    team_name: '',
    team_designation: '',
    purpose: '',
    status: 'Active',
  });

  useEffect(() => {
    fetchTeamDetails();
    fetchTeamInvitations();
    
    // Set up an interval to periodically refresh members and invitations
    const refreshInterval = setInterval(() => {
      if (!editing) { // Don't refresh while editing
        fetchTeamMembers();
        fetchTeamInvitations();
      }
    }, 30000); // Every 30 seconds
    
    return () => clearInterval(refreshInterval);
  }, [id, editing]);

  const fetchTeamDetails = async () => {
    try {
      setLoading(true);
      const response = await teamService.getTeamById(id);
      setTeam(response.team);
      setFormData({
        team_name: response.team.team_name,
        team_designation: response.team.team_designation,
        purpose: response.team.purpose,
        status: response.team.status,
      });

      // Fetch team members
      await fetchTeamMembers();
    } catch (error) {
      console.error('Error fetching team details:', error);
      toast.error('Failed to load team details');
      navigate('/manager/teams');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchTeamMembers = async () => {
    try {
      const membersResponse = await teamService.getTeamMembers(id);
      setMembers(membersResponse.members || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
      // Don't show toast here to avoid too many notifications on background refresh
    }
  };

  const fetchTeamInvitations = async () => {
    try {
      setLoadingInvitations(true);
      const response = await invitationService.getTeamInvitations(id);
      setInvitations(response.invitations || []);
    } catch (error) {
      console.error('Error fetching team invitations:', error);
      // Don't show toast here to avoid too many notifications
    } finally {
      setLoadingInvitations(false);
    }
  };

  const handleUpdateTeam = async (updatedData) => {
    setIsSubmitting(true);

    try {
      const response = await teamService.updateTeam(id, updatedData);
      toast.success('Team updated successfully!');
      setTeam(response.team || updatedData);
      setEditing(false);
      
      // Refresh data after update
      fetchTeamDetails();
    } catch (error) {
      console.error('Error updating team:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update team';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    
    if (!inviteEmail.trim() || !inviteEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    setIsInviting(true);
    
    try {
      await invitationService.createInvitation({
        teamId: id,
        email: inviteEmail.trim()
      });
      
      toast.success('Invitation sent successfully!');
      setInviteEmail('');
      
      // Refresh invitations list
      fetchTeamInvitations();
    } catch (error) {
      console.error('Error inviting developer:', error);
      const errorMessage = error.message || 'Failed to send invitation';
      toast.error(errorMessage);
    } finally {
      setIsInviting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8">
        <p className="mb-4 text-lg text-gray-600">Team not found or you don't have permission to view it.</p>
        <Link
          to="/manager/teams"
          className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Back to Teams
        </Link>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-gray-900">{team.team_name}</h1>
        </div>
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <FiEdit2 className="-ml-1 mr-2 h-5 w-5 text-gray-500" aria-hidden="true" />
            Edit Team
          </button>
        )}
      </div>

      {/* Content */}
      <div className="mb-8 overflow-hidden bg-white shadow sm:rounded-lg">
        {editing ? (
          <div className="p-6">
            <TeamForm 
              initialData={formData}
              onSubmit={handleUpdateTeam}
              isSubmitting={isSubmitting}
              buttonText="Save Changes"
              submitButtonText="Saving..."
              onCancel={() => setEditing(false)}
            />
          </div>
        ) : (
          <div className="px-4 py-5 sm:p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Team Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{team.team_name}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Team Designation</dt>
                <dd className="mt-1 text-sm text-gray-900">{team.team_designation}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Purpose</dt>
                <dd className="mt-1 text-sm text-gray-900">{team.purpose}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      team.status === 'Active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {team.status}
                  </span>
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Created At</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(team.createdAt).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </div>

      {/* Invite Developer Form */}
      <div className="mb-8 overflow-hidden bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Invite a Developer</h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>Send an invitation to a developer to join this team.</p>
          </div>
          <form className="mt-5 sm:flex sm:items-center" onSubmit={handleInviteSubmit}>
            <div className="w-full sm:max-w-xs">
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                type="email"
                name="email"
                id="email"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Developer's email address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={isInviting}
              className="mt-3 inline-flex w-full items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto"
            >
              {isInviting ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  Sending...
                </>
              ) : (
                <>
                  <FiSend className="-ml-1 mr-2 h-4 w-4" />
                  Send Invitation
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Pending Invitations */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Pending Invitations</h2>
        <button 
          type="button"
          onClick={fetchTeamInvitations}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Refresh
        </button>
      </div>

      <div className="mb-8 overflow-hidden bg-white shadow sm:rounded-lg">
        {loadingInvitations ? (
          <div className="flex h-32 flex-col items-center justify-center p-6">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
            <p className="mt-2 text-sm text-gray-500">Loading invitations...</p>
          </div>
        ) : invitations.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center p-6 text-center">
            <FiMail className="mb-2 h-8 w-8 text-gray-400" />
            <p className="mb-1 text-sm font-medium text-gray-900">No pending invitations</p>
            <p className="text-sm text-gray-500">Invite developers to join this team</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {invitations.map((invitation) => (
              <li key={invitation._id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{invitation.invitedEmail}</p>
                    <p className="text-sm text-gray-500">
                      Sent on {new Date(invitation.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        invitation.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : invitation.status === 'Accepted'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {invitation.status}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Members Section */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Team Members</h2>
        <button 
          type="button"
          onClick={fetchTeamMembers}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Refresh
        </button>
      </div>

      <div className="overflow-hidden bg-white shadow sm:rounded-lg">
        {members.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center p-6 text-center">
            <FiUsers className="mb-2 h-8 w-8 text-gray-400" />
            <p className="mb-1 text-sm font-medium text-gray-900">No team members yet</p>
            <p className="text-sm text-gray-500">Add members to start collaboration</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {members.map((member) => (
              <li key={member._id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-200">
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {`${member.first_name?.charAt(0) || ''}${
                            member.last_name?.charAt(0) || ''
                          }`}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {`${member.first_name || ''} ${member.last_name || ''}`}
                      </div>
                      <div className="text-sm text-gray-500">{member.email}</div>
                    </div>
                  </div>
                  <div>
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        member.role === 'Manager'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {member.role}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TeamDetails; 