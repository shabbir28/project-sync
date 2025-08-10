import axiosInstance from './api';

/**
 * Get dashboard statistics for a developer
 * @returns {Promise} Dashboard statistics including tasks, bugs, teams, projects and managers
 */
export const getDeveloperStats = async () => {
    try {
        const response = await axiosInstance.get('/user/developer-stats');
        return response;
    } catch (error) {
        console.error('Error fetching developer statistics:', error);
        return {
            status: 'ERROR',
            message: error.response?.data?.message || 'Failed to fetch dashboard statistics',
        };
    }
};

/**
 * Get recent tasks for a developer
 * @returns {Promise} List of recent tasks
 */
export const getDeveloperTasks = async () => {
    try {
        const response = await axiosInstance.get('/task/developer');
        return response;
    } catch (error) {
        console.error('Error fetching developer tasks:', error);
        return {
            status: 'ERROR',
            message: error.response?.data?.message || 'Failed to fetch tasks',
            tasks: []
        };
    }
};

/**
 * Get recent bugs for a developer
 * @returns {Promise} List of recent bugs
 */
export const getDeveloperBugs = async () => {
    try {
        const response = await axiosInstance.get('/bug'); // This uses the route that returns developer bugs based on role
        return response;
    } catch (error) {
        console.error('Error fetching developer bugs:', error);
        return {
            status: 'ERROR',
            message: error.response?.data?.message || 'Failed to fetch bugs',
            bugs: []
        };
    }
}; 