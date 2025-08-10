import axiosInstance from './api';

/**
 * Invitation service for managing team invitations
 */
const invitationService = {
    /**
     * Send an invitation to a developer
     * @param {Object} invitationData - Invitation data
     * @param {string} invitationData.teamId - Team ID
     * @param {string} invitationData.email - Invitee email
     * @returns {Promise} API response
     */
    createInvitation: async (invitationData) => {
        try {
            return await axiosInstance.post('/invitation', invitationData);
        } catch (error) {
            console.error('Error creating invitation:', error);
            throw error;
        }
    },

    /**
     * Get all pending invitations for the current user
     * @returns {Promise} API response
     */
    getUserInvitations: async () => {
        try {
            return await axiosInstance.get('/invitation/user');
        } catch (error) {
            console.error('Error fetching user invitations:', error);
            throw error;
        }
    },

    /**
     * Get all invitations for a specific team (manager only)
     * @param {string} teamId - Team ID
     * @returns {Promise} API response
     */
    getTeamInvitations: async (teamId) => {
        try {
            return await axiosInstance.get(`/invitation/team/${teamId}`);
        } catch (error) {
            console.error(`Error fetching invitations for team ${teamId}:`, error);
            throw error;
        }
    },

    /**
     * Accept a team invitation
     * @param {string} invitationId - Invitation ID
     * @returns {Promise} API response
     */
    acceptInvitation: async (invitationId) => {
        try {
            return await axiosInstance.put(`/invitation/${invitationId}/accept`);
        } catch (error) {
            console.error(`Error accepting invitation ${invitationId}:`, error);
            throw error;
        }
    },

    /**
     * Reject a team invitation
     * @param {string} invitationId - Invitation ID
     * @returns {Promise} API response
     */
    rejectInvitation: async (invitationId) => {
        try {
            return await axiosInstance.put(`/invitation/${invitationId}/reject`);
        } catch (error) {
            console.error(`Error rejecting invitation ${invitationId}:`, error);
            throw error;
        }
    },

    /**
     * Get all teams the developer is a member of
     * @returns {Promise} API response
     */
    getDeveloperTeams: async () => {
        try {
            return await axiosInstance.get('/invitation/teams/developer');
        } catch (error) {
            console.error('Error fetching developer teams:', error);
            throw error;
        }
    }
};

export default invitationService; 