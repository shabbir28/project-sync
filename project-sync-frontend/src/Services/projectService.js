import api from './api';

const projectService = {
    // Create a new project
    createProject: async (projectData) => {
        try {
            console.log('API Request data:', projectData);
            const response = await api.post('/project', projectData);
            console.log('API Response:', response);
            return response;
        } catch (error) {
            console.error('Project API error:', error);
            if (error.response) {
                console.error('Error response data:', error.response.data);
                throw error.response.data.message || 'Error creating project';
            }
            throw error.message || 'Error creating project';
        }
    },

    // Get all projects (returns manager or developer projects based on user role)
    getAllProjects: async () => {
        try {
            console.log('Calling getAllProjects API');
            const response = await api.get('/project');
            console.log('getAllProjects response:', response);
            return response; // Return the full response
        } catch (error) {
            console.error('Error in getAllProjects:', error);
            if (error.response) {
                console.error('Error response data:', error.response.data);
                throw error.response.data.message || 'Error fetching projects';
            }
            throw error.message || 'Error fetching projects';
        }
    },

    // Get a specific project by ID
    getProjectById: async (projectId) => {
        try {
            console.log('Calling getProjectById API for project:', projectId);
            const response = await api.get(`/project/${projectId}`);
            console.log('getProjectById response:', response);
            return response; // Return the full response
        } catch (error) {
            console.error(`Error fetching project ${projectId}:`, error);
            if (error.response) {
                console.error('Error response data:', error.response.data);
                throw error.response.data.message || 'Error fetching project details';
            }
            throw error.message || 'Error fetching project details';
        }
    },

    // Update a project
    updateProject: async (projectId, projectData) => {
        try {
            console.log(`Updating project ${projectId} with data:`, projectData);
            const response = await api.patch(`/project/${projectId}`, projectData);
            console.log('updateProject response:', response);
            return response; // Return the full response
        } catch (error) {
            console.error(`Error updating project ${projectId}:`, error);
            if (error.response) {
                console.error('Error response data:', error.response.data);
                throw error.response.data.message || 'Error updating project';
            }
            throw error.message || 'Error updating project';
        }
    },

    // Delete a project
    deleteProject: async (projectId) => {
        try {
            console.log(`Deleting project ${projectId}`);
            const response = await api.delete(`/project/${projectId}`);
            console.log('deleteProject response:', response);
            return response; // Return the full response
        } catch (error) {
            console.error(`Error deleting project ${projectId}:`, error);
            if (error.response) {
                console.error('Error response data:', error.response.data);
                throw error.response.data.message || 'Error deleting project';
            }
            throw error.message || 'Error deleting project';
        }
    }
};

export default projectService; 