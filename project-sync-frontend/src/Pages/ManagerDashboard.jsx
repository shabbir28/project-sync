import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import teamService from '../Services/teamService';
import { toast } from 'react-toastify';
import { FiPlus, FiUsers, FiActivity, FiPieChart, FiUserPlus, FiArrowRight } from 'react-icons/fi';

const ManagerDashboard = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTeams: 0,
    activeTeams: 0,
    inactiveTeams: 0
  });

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const response = await teamService.getManagerTeams();
        setTeams(response.teams || []);
        
        // Calculate stats
        const totalTeams = response.teams?.length || 0;
        const activeTeams = response.teams?.filter(team => team.status === 'Active').length || 0;
        const inactiveTeams = totalTeams - activeTeams;
        
        setStats({
          totalTeams,
          activeTeams,
          inactiveTeams
        });
      } catch (error) {
        console.error('Error fetching teams:', error);
        toast.error('Failed to load teams');
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  return (
    <div>
      {/* Welcome Message */}
      <div className="mb-6 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
        <p className="mt-1 text-gray-600">
          Welcome to your manager dashboard. Manage your teams and projects efficiently.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 mr-4">
                <FiUsers className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Teams</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTeams}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 mr-4">
                <FiActivity className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active Teams</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeTeams}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100 mr-4">
                <FiPieChart className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Inactive Teams</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inactiveTeams}</p>
              </div>
            </div>
          </div>
          
          {/* <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 mr-4">
                <FiUserPlus className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Members</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div> */}
        </div>
      </div>

      {/* Teams Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Your Teams</h2>
              <Link 
                to="/manager/teams/create"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FiPlus className="mr-1.5 h-4 w-4" />
                Create Team
              </Link>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : teams.length > 0 ? (
              <div>
                <ul className="divide-y divide-gray-200">
                  {teams.map((team) => (
                    <li key={team._id} className="px-6 py-4 hover:bg-gray-50">
                      <Link to={`/manager/teams/${team._id}`} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{team.team_name}</p>
                          <p className="text-xs text-gray-500 mt-1">{team.team_designation}</p>
                        </div>
                        <div className="flex items-center">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            team.status === 'Active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {team.status}
                          </span>
                          <FiArrowRight className="ml-3 h-4 w-4 text-gray-400" />
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
                
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <Link to="/manager/teams" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center">
                    View all teams <FiArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center">
                <FiUsers className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-gray-500">You haven't created any teams yet.</p>
                <Link 
                  to="/manager/teams/create" 
                  className="mt-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <FiPlus className="-ml-1 mr-2 h-4 w-4" />
                  Create Your First Team
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Quick Actions</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <Link to="/manager/teams/create" className="block w-full py-2 px-4 bg-gray-50 hover:bg-gray-100 rounded-md border border-gray-200 text-center text-gray-800 font-medium transition-colors">
                Create Team
              </Link>
              
              <Link to="/manager/profile" className="block w-full py-2 px-4 bg-gray-50 hover:bg-gray-100 rounded-md border border-gray-200 text-center text-gray-800 font-medium transition-colors">
                View Profile
              </Link>
              
              <Link to="/manager/teams" className="block w-full py-2 px-4 bg-gray-50 hover:bg-gray-100 rounded-md border border-gray-200 text-center text-gray-800 font-medium transition-colors">
                Manage Teams
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard; 