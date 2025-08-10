import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../Services/authContext';
import { useTheme } from '../Services/themeContext';
import { 
  FiHome, 
  FiUsers, 
  FiUser, 
  FiBriefcase, 
  FiCheckSquare, 
  FiAlertCircle, 
  FiSettings, 
  FiLogOut,
  FiSearch,
  FiBell,
  FiMoon,
  FiSun,
  FiArrowUp,
  FiArrowDown,
  FiTrendingUp,
  FiCalendar,
  FiClock,
  FiUserCheck,
  FiActivity
} from 'react-icons/fi';
import { getDeveloperStats, getDeveloperTasks, getDeveloperBugs } from '../Services/dashboardService';
import { toast } from 'react-toastify';
import ActivityChart from '../Components/Common/ActivityChart';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTeams: 0,
    activeTasks: 0,
    ongoingProjects: 0,
    deadlinesThisWeek: 0,
    totalCases: 0,
    totalBugs: 0,
    completedProjects: 0,
    activeMembers: 0
  });
  const [activityLogs, setActivityLogs] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch developer statistics
        const statsResponse = await getDeveloperStats();
        if (statsResponse.status === 'SUCCESS') {
          const statsData = statsResponse.stats;
          setStats({
            totalTeams: statsData.teams?.count || 0,
            activeTasks: statsData.tasks?.inProgress || 0,
            ongoingProjects: statsData.projects?.count || 0,
            deadlinesThisWeek: 3, // This would come from backend
            totalCases: statsData.tasks?.total || 0,
            totalBugs: statsData.bugs?.total || 0,
            completedProjects: statsData.projects?.completed || 0,
            activeMembers: statsData.teams?.members || 0
          });
        }

        // Fetch recent tasks
        const tasksResponse = await getDeveloperTasks();
        if (tasksResponse.status === 'SUCCESS') {
          // Use tasks for activity logs
        }

        // Fetch recent bugs
        const bugsResponse = await getDeveloperBugs();
        if (bugsResponse.status === 'SUCCESS') {
          // Use bugs for activity logs
        }

        // Generate activity logs from tasks and bugs
        const allActivities = [
          ...(tasksResponse.tasks || []).map(task => ({
            id: task._id,
            type: 'task',
            name: task.task_name,
            project: task.project_id?.project_name || 'Unknown Project',
            status: task.status,
            date: task.created_at,
            assignedTo: currentUser?.username || 'You'
          })),
          ...(bugsResponse.bugs || []).map(bug => ({
            id: bug._id,
            type: 'bug',
            name: bug.bug_name,
            project: bug.project_id?.project_name || 'Unknown Project',
            status: bug.status,
            date: bug.created_at,
            assignedTo: currentUser?.username || 'You'
          }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

        setActivityLogs(allActivities);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser]);



  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'in progress':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'to do':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900' : 'bg-gray-50'}`}>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900' : 'bg-gray-50'}`}>
      {/* Top Bar */}
      <div className={`sticky top-0 z-50 ${isDarkMode ? 'bg-slate-800/80 backdrop-blur-lg border-b border-slate-700' : 'bg-white/80 backdrop-blur-lg border-b border-gray-200'}`}>
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Project Sync
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className={`relative ${isDarkMode ? 'bg-slate-700' : 'bg-gray-100'} rounded-lg`}>
              <FiSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Search projects, tasks..."
                className={`pl-10 pr-4 py-2 bg-transparent border-none outline-none text-sm ${isDarkMode ? 'text-white placeholder-slate-400' : 'text-gray-900 placeholder-gray-500'}`}
              />
            </div>

            {/* Notifications */}
            <button className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-gray-100 text-gray-600'}`}>
              <FiBell className="h-5 w-5" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-gray-100 text-gray-600'}`}
            >
              {isDarkMode ? <FiSun className="h-5 w-5" /> : <FiMoon className="h-5 w-5" />}
            </button>

            {/* User Avatar */}
            <div className={`flex items-center space-x-2 p-2 rounded-lg ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}>
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {currentUser?.username?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {currentUser?.username || 'User'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className={`w-64 min-h-screen ${isDarkMode ? 'bg-slate-800/50 backdrop-blur-lg border-r border-slate-700' : 'bg-white border-r border-gray-200'}`}>
          <div className="p-6">
            <nav className="space-y-2">
              <Link
                to="/dashboard"
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                  isDarkMode 
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}
              >
                <FiHome className="h-5 w-5" />
                <span>Dashboard</span>
              </Link>
              
              <Link
                to="/teams"
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                  isDarkMode 
                    ? 'text-slate-300 hover:bg-slate-700/50' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FiUsers className="h-5 w-5" />
                <span>Teams</span>
              </Link>
              
              <Link
                to="/employees"
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                  isDarkMode 
                    ? 'text-slate-300 hover:bg-slate-700/50' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FiUser className="h-5 w-5" />
                <span>Employees</span>
              </Link>
              
              <Link
                to="/clients"
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                  isDarkMode 
                    ? 'text-slate-300 hover:bg-slate-700/50' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FiUserCheck className="h-5 w-5" />
                <span>Clients</span>
              </Link>
              
              <Link
                to="/projects"
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                  isDarkMode 
                    ? 'text-slate-300 hover:bg-slate-700/50' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FiBriefcase className="h-5 w-5" />
                <span>Projects</span>
              </Link>
              
              <Link
                to="/tasks"
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                  isDarkMode 
                    ? 'text-slate-300 hover:bg-slate-700/50' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FiCheckSquare className="h-5 w-5" />
                <span>Tasks</span>
              </Link>
              
              <Link
                to="/bugs"
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                  isDarkMode 
                    ? 'text-slate-300 hover:bg-slate-700/50' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FiAlertCircle className="h-5 w-5" />
                <span>Bugs</span>
              </Link>
              
              <div className="border-t border-slate-700 my-4"></div>
              
              <Link
                to="/settings"
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                  isDarkMode 
                    ? 'text-slate-300 hover:bg-slate-700/50' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FiSettings className="h-5 w-5" />
                <span>Settings</span>
              </Link>
              
              <button
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors w-full text-left ${
                  isDarkMode 
                    ? 'text-red-400 hover:bg-red-500/10' 
                    : 'text-red-600 hover:bg-red-50'
                }`}
              >
                <FiLogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Welcome Section */}
          <div className={`mb-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {currentUser?.username || 'Developer'}!
            </h1>
            <p className={`text-lg ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>
              Here's what's happening with your projects today.
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className={`p-6 rounded-xl backdrop-blur-lg border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'} shadow-lg`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Total Teams</p>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.totalTeams}</p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <FiUsers className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-xl backdrop-blur-lg border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'} shadow-lg`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Active Tasks</p>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.activeTasks}</p>
                </div>
                <div className="p-3 bg-cyan-500/20 rounded-lg">
                  <FiCheckSquare className="h-6 w-6 text-cyan-400" />
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-xl backdrop-blur-lg border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'} shadow-lg`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Ongoing Projects</p>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.ongoingProjects}</p>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <FiBriefcase className="h-6 w-6 text-purple-400" />
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-xl backdrop-blur-lg border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'} shadow-lg`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Deadlines This Week</p>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.deadlinesThisWeek}</p>
                </div>
                <div className="p-3 bg-coral-500/20 rounded-lg">
                  <FiCalendar className="h-6 w-6 text-coral-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts and Overview Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Activity Chart */}
            <div className={`lg:col-span-2 p-6 rounded-xl backdrop-blur-lg border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'} shadow-lg`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Project Activity</h3>
                <div className="flex space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>
                    Last 30 days
                  </span>
                </div>
              </div>
              
              <ActivityChart isDarkMode={isDarkMode} />
            </div>

            {/* Overview Stats */}
            <div className={`p-6 rounded-xl backdrop-blur-lg border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'} shadow-lg`}>
              <h3 className={`text-lg font-semibold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Overview</h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>Total Cases</span>
                    <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.totalCases}</span>
                  </div>
                  <div className={`w-full bg-slate-700 rounded-full h-2`}>
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${Math.min((stats.totalCases / 100) * 100, 100)}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>Total Bugs</span>
                    <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.totalBugs}</span>
                  </div>
                  <div className={`w-full bg-slate-700 rounded-full h-2`}>
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: `${Math.min((stats.totalBugs / 50) * 100, 100)}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>Completed Projects</span>
                    <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.completedProjects}</span>
                  </div>
                  <div className={`w-full bg-slate-700 rounded-full h-2`}>
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min((stats.completedProjects / 20) * 100, 100)}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>Active Members</span>
                    <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.activeMembers}</span>
                  </div>
                  <div className={`w-full bg-slate-700 rounded-full h-2`}>
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min((stats.activeMembers / 30) * 100, 100)}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Table */}
          <div className={`rounded-xl backdrop-blur-lg border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'} shadow-lg overflow-hidden`}>
            <div className="px-6 py-4 border-b border-slate-700">
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Recent Activity</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${isDarkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-gray-500'}`}>
                      Task ID
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-gray-500'}`}>
                      Task Name
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-gray-500'}`}>
                      Project
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-gray-500'}`}>
                      Assigned To
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-gray-500'}`}>
                      Date & Time
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-gray-500'}`}>
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-gray-200'}`}>
                  {activityLogs.map((activity) => (
                    <tr key={activity.id} className={`${isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'}`}>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        #{activity.id.slice(-6)}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                        {activity.name}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                        {activity.project}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                        {activity.assignedTo}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                        {formatDate(activity.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(activity.status)}`}>
                          {activity.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {activityLogs.length === 0 && (
              <div className="px-6 py-12 text-center">
                <FiActivity className={`h-12 w-12 mx-auto mb-4 ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`} />
                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                  No recent activity to display
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 