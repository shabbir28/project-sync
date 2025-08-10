import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiCalendar, FiBriefcase, FiChevronDown, FiChevronUp, FiFolder, FiCheckCircle, FiClock } from 'react-icons/fi';
import { useAuth } from '../../Services/authContext';
import invitationService from '../../Services/invitationService';
import projectService from '../../Services/projectService';
import { toast } from 'react-toastify';

const MyTeams = () => {
  const { currentUser } = useAuth();
  const [teams, setTeams] = useState([]);
  const [expandedTeams, setExpandedTeams] = useState({});
  const [teamProjects, setTeamProjects] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState({});

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await invitationService.getDeveloperTeams();
      const teamsData = response.teams || [];
      setTeams(teamsData);
      
      // Initialize expanded state for all teams to false
      const expandedState = {};
      teamsData.forEach(team => {
        expandedState[team._id] = false;
      });
      setExpandedTeams(expandedState);
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast.error('Failed to load your teams');
    } finally {
      setLoading(false);
    }
  };

  const toggleTeam = async (teamId) => {
    // Toggle expanded state
    setExpandedTeams(prev => ({
      ...prev,
      [teamId]: !prev[teamId]
    }));

    // If expanding and projects not loaded yet
    if (!expandedTeams[teamId] && !teamProjects[teamId]) {
      fetchTeamProjects(teamId);
    }
  };

  const fetchTeamProjects = async (teamId) => {
    try {
      setLoadingProjects(prev => ({ ...prev, [teamId]: true }));
      
      // Fetch projects for this team
      const response = await projectService.getAllProjects();
      let projects = [];
      
      if (Array.isArray(response)) {
        projects = response;
      } else if (response && response.projects && Array.isArray(response.projects)) {
        projects = response.projects;
      }
      
      // Filter projects for this team
      const filteredProjects = projects.filter(
        project => project.team && project.team._id === teamId
      );
      
      setTeamProjects(prev => ({
        ...prev,
        [teamId]: filteredProjects
      }));
    } catch (error) {
      console.error(`Error fetching projects for team ${teamId}:`, error);
      toast.error('Failed to load team projects');
    } finally {
      setLoadingProjects(prev => ({ ...prev, [teamId]: false }));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Completed':
        return 'bg-blue-100 text-blue-800';
      case 'On Hold':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
        <p className="mt-2 text-sm text-gray-600">
          Teams you are participating in as a developer
        </p>
      </div>

      {/* Content */}
      {teams.length > 0 ? (
        <div className="space-y-4">
          {teams.map((team) => (
            <div key={team._id} className="overflow-hidden bg-white shadow sm:rounded-lg">
              <div 
                className="p-4 cursor-pointer hover:bg-gray-50 flex justify-between items-center"
                onClick={() => toggleTeam(team._id)}
              >
                <div>
                  <div className="flex items-center">
                    <h3 className="text-lg font-medium text-gray-900 mr-3">
                      {team.team_name}
                    </h3>
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        team.status === 'Active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {team.status}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:space-x-6">
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <FiBriefcase className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                      {team.team_designation}
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <FiCalendar className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                      Joined: {new Date(team.joinedAt).toLocaleDateString()}
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <FiUsers className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                      Role: {team.role || 'Developer'}
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    {team.purpose}
                  </p>
                </div>
                <div>
                  {expandedTeams[team._id] ? (
                    <FiChevronUp className="h-6 w-6 text-gray-500" />
                  ) : (
                    <FiChevronDown className="h-6 w-6 text-gray-500" />
                  )}
                </div>
              </div>
              
              {expandedTeams[team._id] && (
                <div className="border-t border-gray-200 px-4 py-5">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Team Projects</h4>
                  
                  {loadingProjects[team._id] ? (
                    <div className="flex justify-center py-4">
                      <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
                    </div>
                  ) : teamProjects[team._id] && teamProjects[team._id].length > 0 ? (
                    <div className="rounded-lg border border-gray-200 overflow-hidden">
                      <div className="divide-y divide-gray-200">
                        {teamProjects[team._id].map(project => (
                          <div key={project._id} className="p-4 hover:bg-gray-50">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                <FiFolder className="h-5 w-5 text-blue-500 mr-2" />
                                <h5 className="font-medium text-gray-900">{project.project_name}</h5>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                                {project.status}
                              </span>
                            </div>
                            <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <div className="text-sm text-gray-500">
                                <span className="font-medium">Client:</span> {project.client}
                              </div>
                              <div className="text-sm text-gray-500">
                                <span className="font-medium">Tech:</span> {project.tech_stack}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center">
                                <FiClock className="mr-1 h-4 w-4 text-gray-400" />
                                {formatDate(project.estimated_time)}
                              </div>
                            </div>
                            <div className="mt-3">
                              <Link 
                                to={`/developer/projects/${project._id}`}
                                className="text-sm text-blue-600 hover:text-blue-800"
                              >
                                View Details →
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <FiFolder className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                      <p>No projects found for this team</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg bg-white p-6 text-center shadow">
          <FiUsers className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No teams</h3>
          <p className="mt-1 text-sm text-gray-500">
            You haven't joined any teams yet. Team managers can invite you to their teams.
          </p>
          <Link
            to="/developer/invitations"
            className="mt-4 inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Check Invitations
          </Link>
        </div>
      )}
    </div>
  );
};

export default MyTeams; 