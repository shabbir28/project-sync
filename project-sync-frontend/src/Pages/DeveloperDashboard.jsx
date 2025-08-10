import { useState, useEffect } from 'react';
import { useAuth } from '../Services/authContext';
import { Link } from 'react-router-dom';
import { 
  FiUsers, 
  FiMail, 
  FiCheckCircle, 
  FiClock, 
  FiAlertCircle, 
  FiArrowRight, 
  FiBriefcase,
  FiUserCheck
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import invitationService from '../Services/invitationService';
import { getDeveloperStats, getDeveloperTasks, getDeveloperBugs } from '../Services/dashboardService';

const DeveloperDashboard = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [invitations, setInvitations] = useState([]);
  const [stats, setStats] = useState(null);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [assignedBugs, setAssignedBugs] = useState([]);

  // Fetch all data for dashboard
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch statistics
        const statsResponse = await getDeveloperStats();
        if (statsResponse.status === 'SUCCESS') {
          setStats(statsResponse.stats);
        } else {
          console.error('Failed to fetch statistics:', statsResponse.message);
        }
        
        // Fetch tasks
        const tasksResponse = await getDeveloperTasks();
        if (tasksResponse.status === 'SUCCESS') {
          setAssignedTasks(tasksResponse.tasks || []);
        } else {
          console.error('Failed to fetch tasks:', tasksResponse.message);
        }
        
        // Fetch bugs
        const bugsResponse = await getDeveloperBugs();
        if (bugsResponse.status === 'SUCCESS') {
          setAssignedBugs(bugsResponse.bugs || []);
        } else {
          console.error('Failed to fetch bugs:', bugsResponse.message);
        }
        
        // Fetch invitations
        await fetchInvitations();
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Error loading dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  
  const fetchInvitations = async () => {
    try {
      const response = await invitationService.getUserInvitations();
      setInvitations(response.invitations || []);
    } catch (error) {
      console.error('Error fetching invitations:', error);
      // Don't show toast here to avoid too many notifications
    }
  };

  // Determine task status style
  const getStatusStyle = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'to do':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  // Calculate statistics from the fetched data
  const taskStats = stats?.tasks || { total: 0, completed: 0, inProgress: 0, toDo: 0 };
  const bugStats = stats?.bugs || { total: 0, active: 0, completed: 0 };
  
  return (
    <div>
      {/* Welcome message */}
      <div className="mb-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {currentUser?.username || 'Developer'}!</h1>
        <p className="mt-1 text-gray-600">
          Here's what's happening with your projects today.
        </p>
      </div>

      {/* Team Invitations Alert */}
      {invitations.length > 0 && (
        <div className="mb-6 bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="p-2 bg-blue-100 rounded-full">
                <FiMail className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-blue-800">
                You have {invitations.length} pending team {invitations.length === 1 ? 'invitation' : 'invitations'}!
              </p>
              <div className="mt-2">
                <Link
                  to="/developer/invitations"
                  className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  View invitations <FiArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Statistics Grid */}
      <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Teams Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 mr-4">
              <FiUsers className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Teams</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.teams?.count || 0}</p>
            </div>
          </div>
        </div>
        
        {/* Projects Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100 mr-4">
              <FiBriefcase className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Projects</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.projects?.count || 0}</p>
            </div>
          </div>
        </div>
        
        {/* Managers Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-pink-100 mr-4">
              <FiUserCheck className="h-6 w-6 text-pink-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Managers</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.managers?.count || 0}</p>
            </div>
          </div>
        </div>
        
        {/* Bugs Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 mr-4">
              <FiAlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Bugs</p>
              <p className="text-2xl font-bold text-gray-900">{bugStats.total}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Task summary cards */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Task Overview</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 mr-4">
                <FiClock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{taskStats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 mr-4">
                <FiCheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{taskStats.completed}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 mr-4">
                <FiClock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">{taskStats.inProgress}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 mr-4">
                <FiAlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">To Do</p>
                <p className="text-2xl font-bold text-gray-900">{taskStats.toDo}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks list */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Your Tasks</h2>
            <p className="mt-1 text-sm text-gray-500">
              A list of all your assigned tasks from different projects.
            </p>
          </div>
          <Link 
            to="/developer/tasks" 
            className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center"
          >
            View all tasks <FiArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        
        {assignedTasks.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p>You don't have any assigned tasks yet.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {assignedTasks.slice(0, 3).map((task) => (
              <li key={task._id} className="hover:bg-gray-50">
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">{task.task_name}</p>
                    <span className={`px-2 py-1 inline-flex text-xs font-medium rounded-full ${getStatusStyle(task.status)}`}>
                      {task.status}
                    </span>
                  </div>
                  <div className="mt-2 flex justify-between items-center">
                    <div className="flex items-center text-sm text-gray-500">
                      <FiBriefcase className="mr-1.5 h-4 w-4 text-gray-400" />
                      {task.project_id?.project_name || 'Unknown Project'}
                    </div>
                    <div className="text-sm text-gray-500">
                      Due: {formatDate(task.expected_completion_date)}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Bugs list */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Your Bugs</h2>
            <p className="mt-1 text-sm text-gray-500">
              A list of recent bugs assigned to you.
            </p>
          </div>
          <Link 
            to="/developer/bugs" 
            className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center"
          >
            View all bugs <FiArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        
        {assignedBugs.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p>You don't have any assigned bugs yet.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {assignedBugs.slice(0, 3).map((bug) => (
              <li key={bug._id} className="hover:bg-gray-50">
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">{bug.bug_name}</p>
                    <span className={`px-2 py-1 inline-flex text-xs font-medium rounded-full ${bug.status === 'active' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {bug.status}
                    </span>
                  </div>
                  <div className="mt-2 flex justify-between items-center">
                    <div className="flex items-center text-sm text-gray-500">
                      <FiBriefcase className="mr-1.5 h-4 w-4 text-gray-400" />
                      {bug.project_id?.project_name || 'Unknown Project'}
                    </div>
                    <div className="text-sm text-gray-500">
                      Due: {formatDate(bug.expected_completion_date)}
                    </div>
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

export default DeveloperDashboard; 