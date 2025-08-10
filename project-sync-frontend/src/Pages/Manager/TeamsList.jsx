import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiPlus,
  FiUsers,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiAlertTriangle
} from 'react-icons/fi';
import { useAuth } from '../../Services/authContext';
import teamService from '../../Services/teamService';
import { toast } from 'react-toastify';

const TeamsList = () => {
  const { currentUser } = useAuth();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTeamId, setDeleteTeamId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

  const handleDeleteClick = (teamId) => {
    setDeleteTeamId(teamId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTeamId) return;
    
    try {
      await teamService.deleteTeam(deleteTeamId);
      toast.success('Team deleted successfully');
      // Update teams list
      setTeams(teams.filter(team => team._id !== deleteTeamId));
    } catch (error) {
      console.error('Error deleting team:', error);
      toast.error('Failed to delete team');
    } finally {
      setShowDeleteModal(false);
      setDeleteTeamId(null);
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
        <h1 className="text-2xl font-bold text-gray-900">My Teams</h1>
      </div>

      {/* Content */}
      {teams.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <h2 className="text-lg font-bold text-gray-900">Manage Your Teams</h2>
            <p className="mt-1 text-sm text-gray-500">Create, view, and manage your project teams.</p>
          </div>
          
          <div className="overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 border-b border-gray-200 bg-gray-50">
              <div className="col-span-3">TEAM NAME</div>
              <div className="col-span-2">DESIGNATION</div>
              <div className="col-span-3">PURPOSE</div>
              <div className="col-span-2">STATUS</div>
              <div className="col-span-2 text-right">ACTIONS</div>
            </div>
            
            {teams.map((team) => (
              <div key={team._id} className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 border-b border-gray-100">
                <div className="col-span-3 flex items-center">
                  <div className="p-2 bg-blue-50 rounded-full mr-3">
                    <FiUsers className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="font-medium text-gray-900">
                    {team.team_name}
                  </div>
                </div>
                <div className="col-span-2 text-sm text-gray-500 flex items-center">{team.team_designation}</div>
                <div className="col-span-3 text-sm text-gray-500 flex items-center">
                  {team.purpose.length > 100 ? `${team.purpose.substring(0, 100)}...` : team.purpose}
                </div>
                <div className="col-span-2 flex items-center">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      team.status === 'Active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {team.status}
                  </span>
                </div>
                <div className="col-span-2 text-right">
                  <div className="flex justify-end space-x-2">
                    <Link
                      to={`/manager/teams/${team._id}`}
                      className="rounded p-1.5 bg-gray-50 text-blue-600 hover:bg-blue-50 border border-gray-200 transition-colors"
                      title="View Team Details"
                    >
                      <FiEye className="h-4 w-4" />
                    </Link>
                    <Link
                      to={`/manager/teams/${team._id}`}
                      className="rounded p-1.5 bg-gray-50 text-yellow-600 hover:bg-yellow-50 border border-gray-200 transition-colors"
                      title="Edit Team"
                    >
                      <FiEdit2 className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(team._id)}
                      className="rounded p-1.5 bg-gray-50 text-red-600 hover:bg-red-50 border border-gray-200 transition-colors"
                      title="Delete Team"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
          <div className="p-3 bg-blue-50 rounded-full inline-flex mx-auto mb-4">
            <FiUsers className="h-8 w-8 text-blue-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No teams found</h3>
          <p className="mt-2 text-gray-500 max-w-md mx-auto">
            Get started by creating a new team for your projects. Teams help you organize developers and manage projects more efficiently.
          </p>
          <div className="mt-6">
            <Link
              to="/manager/teams/create"
              className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <FiPlus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Create Your First Team
            </Link>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto bg-gray-500 bg-opacity-75">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="w-full max-w-md overflow-hidden rounded-lg bg-white shadow-xl">
              <div className="bg-white px-6 py-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                      <FiAlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Delete Team</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete this team? This action cannot be undone and all team
                        data will be permanently removed.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                <button
                  type="button"
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  onClick={confirmDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamsList; 