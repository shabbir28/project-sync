import axiosInstance from './api';

/**
 * Team service for manager operations
 */
const teamService = {
    /**
     * Get all teams for the manager
     * @returns {Promise} API response
     */
    getManagerTeams: async () => {
        try {
            return await axiosInstance.get('/team');
        } catch (error) {
            console.error('Error fetching teams:', error);
            throw error;
        }
    },

    /**
     * Get a specific team
     * @param {string} teamId - Team ID
     * @returns {Promise} API response
     */
    getTeamById: async (teamId) => {
        try {
            return await axiosInstance.get(`/team/${teamId}`);
        } catch (error) {
            console.error(`Error fetching team ${teamId}:`, error);
            throw error;
        }
    },

    /**
     * Create a new team
     * @param {Object} teamData - Team data
     * @param {string} teamData.team_name - Team name
     * @param {string} teamData.team_designation - Team designation
     * @param {string} teamData.purpose - Team purpose
     * @returns {Promise} API response
     */
    createTeam: async (teamData) => {
        try {
            return await axiosInstance.post('/team', teamData);
        } catch (error) {
            console.error('Error creating team:', error);
            throw error;
        }
    },

    /**
     * Update an existing team
     * @param {string} teamId - Team ID
     * @param {Object} teamData - Updated team data
     * @returns {Promise} API response
     */
    updateTeam: async (teamId, teamData) => {
        try {
            return await axiosInstance.put(`/team/${teamId}`, teamData);
        } catch (error) {
            console.error(`Error updating team ${teamId}:`, error);
            throw error;
        }
    },

    /**
     * Delete a team
     * @param {string} teamId - Team ID
     * @returns {Promise} API response
     */
    deleteTeam: async (teamId) => {
        try {
            return await axiosInstance.delete(`/team/${teamId}`);
        } catch (error) {
            console.error(`Error deleting team ${teamId}:`, error);
            throw error;
        }
    },

    /**
     * Get team members
     * @param {string} teamId - Team ID
     * @returns {Promise} API response
     */
    getTeamMembers: async (teamId) => {
        try {
            return await axiosInstance.get(`/team/${teamId}/members`);
        } catch (error) {
            console.error(`Error fetching members for team ${teamId}:`, error);
            throw error;
        }
    },

    /**
     * Get team developers
     * @param {string} teamId - Team ID
     * @returns {Promise} API response with developers array
     */
    getTeamDevelopers: async (teamId) => {
        try {
            console.log(`Fetching developers for team ${teamId}, type: ${typeof teamId}`);
            // Ensure teamId is a string and has a valid format
            if (!teamId || typeof teamId !== 'string' || !teamId.match(/^[0-9a-fA-F]{24}$/)) {
                console.error('Invalid team ID format:', teamId);
                throw new Error('Invalid team ID format');
            }

            const response = await axiosInstance.get(`/team/${teamId}/developers`);
            console.log('Team developers response:', response);
            return response;
        } catch (error) {
            console.error(`Error fetching developers for team ${teamId}:`, error);
            throw error;
        }
    },

    /**
     * Add member to team
     * @param {string} teamId - Team ID
     * @param {Object} userData - User data
     * @returns {Promise} API response
     */
    addTeamMember: async (teamId, userData) => {
        try {
            return await axiosInstance.post(`/team/${teamId}/members`, userData);
        } catch (error) {
            console.error(`Error adding member to team ${teamId}:`, error);
            throw error;
        }
    },

    /**
     * Remove member from team
     * @param {string} teamId - Team ID
     * @param {string} userId - User ID
     * @returns {Promise} API response
     */
    removeTeamMember: async (teamId, userId) => {
        try {
            return await axiosInstance.delete(`/team/${teamId}/members/${userId}`);
        } catch (error) {
            console.error(`Error removing member from team ${teamId}:`, error);
            throw error;
        }
    }
};

export default teamService; 