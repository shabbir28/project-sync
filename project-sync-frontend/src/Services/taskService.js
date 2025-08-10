import api from './api';

const taskService = {
    // Create a new task (manager only)
    createTask: async (taskData) => {
        try {
            console.log('API Request data:', taskData);
            const response = await api.post('/task', taskData);
            console.log('API Response:', response);
            return response;
        } catch (error) {
            console.error('Task API error:', error);
            if (error.response) {
                console.error('Error response data:', error.response.data);
                throw error.response.data.message || 'Error creating task';
            }
            throw error.message || 'Error creating task';
        }
    },

    // Get all tasks (returns manager or developer tasks based on user role)
    getAllTasks: async () => {
        try {
            console.log('Calling getAllTasks API');
            const response = await api.get('/task');
            console.log('getAllTasks response:', response);
            return response; // Return the full response
        } catch (error) {
            console.error('Error in getAllTasks:', error);
            if (error.response) {
                console.error('Error response data:', error.response.data);
                throw error.response.data.message || 'Error fetching tasks';
            }
            throw error.message || 'Error fetching tasks';
        }
    },

    // Get a specific task by ID
    getTaskById: async (taskId) => {
        try {
            console.log('Calling getTaskById API for task:', taskId);
            const response = await api.get(`/task/${taskId}`);
            console.log('getTaskById response:', response);
            return response; // Return the full response
        } catch (error) {
            console.error(`Error fetching task ${taskId}:`, error);
            if (error.response) {
                console.error('Error response data:', error.response.data);
                throw error.response.data.message || 'Error fetching task details';
            }
            throw error.message || 'Error fetching task details';
        }
    },

    // Update a task
    // For managers: can update any field
    // For developers: can only update status to completed
    updateTask: async (taskId, taskData) => {
        try {
            console.log(`Updating task ${taskId} with data:`, taskData);
            const response = await api.patch(`/task/${taskId}`, taskData);
            console.log('updateTask response:', response);
            return response; // Return the full response
        } catch (error) {
            console.error(`Error updating task ${taskId}:`, error);
            if (error.response) {
                console.error('Error response data:', error.response.data);
                throw error.response.data.message || 'Error updating task';
            }
            throw error.message || 'Error updating task';
        }
    },

    // Delete a task (manager only)
    deleteTask: async (taskId) => {
        try {
            console.log(`Deleting task ${taskId}`);
            const response = await api.delete(`/task/${taskId}`);
            console.log('deleteTask response:', response);
            return response; // Return the full response
        } catch (error) {
            console.error(`Error deleting task ${taskId}:`, error);
            if (error.response) {
                console.error('Error response data:', error.response.data);
                throw error.response.data.message || 'Error deleting task';
            }
            throw error.message || 'Error deleting task';
        }
    },

    // Mark a task as completed (developer only)
    markTaskAsCompleted: async (taskId) => {
        try {
            console.log(`Marking task ${taskId} as completed`);
            const response = await api.patch(`/task/${taskId}`, { status: 'completed' });
            console.log('markTaskAsCompleted response:', response);
            return response; // Return the full response
        } catch (error) {
            console.error(`Error marking task ${taskId} as completed:`, error);
            if (error.response) {
                console.error('Error response data:', error.response.data);
                throw error.response.data.message || 'Error updating task status';
            }
            throw error.message || 'Error updating task status';
        }
    }
};

export default taskService; 