import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiCheck, FiX, FiUsers, FiMail } from 'react-icons/fi';
import { useAuth } from '../../Services/authContext';
import invitationService from '../../Services/invitationService';
import { toast } from 'react-toastify';

const Invitations = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(null);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const response = await invitationService.getUserInvitations();
      setInvitations(response.invitations || []);
    } catch (error) {
      console.error('Error fetching invitations:', error);
      toast.error('Failed to load team invitations');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (invitationId) => {
    setResponding(invitationId);
    
    try {
      await invitationService.acceptInvitation(invitationId);
      toast.success('Invitation accepted! You have joined the team.');
      // Remove from the list
      setInvitations(invitations.filter(inv => inv._id !== invitationId));
      
      // Navigate to My Teams to show the updated team membership
      // This ensures the user sees they're now part of the team
      setTimeout(() => {
        navigate('/developer/my-teams');
      }, 1500);
    } catch (error) {
      console.error('Error accepting invitation:', error);
      const errorMessage = error.message || 'Failed to accept invitation';
      toast.error(errorMessage);
    } finally {
      setResponding(null);
    }
  };

  const handleReject = async (invitationId) => {
    setResponding(invitationId);
    
    try {
      await invitationService.rejectInvitation(invitationId);
      toast.info('Invitation rejected.');
      // Remove from the list
      setInvitations(invitations.filter(inv => inv._id !== invitationId));
    } catch (error) {
      console.error('Error rejecting invitation:', error);
      const errorMessage = error.message || 'Failed to reject invitation';
      toast.error(errorMessage);
    } finally {
      setResponding(null);
    }
  };

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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Team Invitations</h1>
        <p className="mt-2 text-sm text-gray-600">
          View and respond to team invitations from project managers.
        </p>
      </div>

      {/* Content */}
      {invitations.length > 0 ? (
        <div className="overflow-hidden bg-white shadow sm:rounded-lg">
          <ul className="divide-y divide-gray-200">
            {invitations.map((invitation) => (
              <li key={invitation._id} className="p-4">
                <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">
                      {invitation.team.team_name}
                    </h3>
                    <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:space-x-6">
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <FiUsers className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                        {invitation.team.team_designation}
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <FiMail className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                        From: {invitation.invitedBy?.username || invitation.invitedBy?.email || 'Team Manager'}
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      {invitation.team.purpose}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Received {new Date(invitation.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => handleReject(invitation._id)}
                      disabled={responding === invitation._id}
                      className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                      {responding === invitation._id ? (
                        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-500 border-t-transparent"></span>
                      ) : (
                        <FiX className="-ml-0.5 mr-2 h-4 w-4 text-red-500" />
                      )}
                      Decline
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAccept(invitation._id)}
                      disabled={responding === invitation._id}
                      className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                      {responding === invitation._id ? (
                        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                      ) : (
                        <FiCheck className="-ml-0.5 mr-2 h-4 w-4" />
                      )}
                      Accept
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="rounded-lg bg-white p-6 text-center shadow">
          <FiMail className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No invitations</h3>
          <p className="mt-1 text-sm text-gray-500">
            You don't have any pending team invitations.
          </p>
        </div>
      )}
    </div>
  );
};

export default Invitations; 