import api from './api';

const clientService = {
    // Create a new client
    createClient: async (clientData) => {
        try {
            console.log('Creating client with data:', clientData);
            const response = await api.post('/client', clientData);
            console.log('createClient response:', response);
            return response;
        } catch (error) {
            console.error('Error creating client:', error);
            if (error.response) {
                console.error('Error response data:', error.response.data);
                throw error.response.data.message || 'Error creating client';
            }
            throw error.message || 'Error creating client';
        }
    },

    // Get all clients (returns all clients for manager's teams)
    getAllClients: async () => {
        try {
            console.log('Fetching all clients');
            const response = await api.get('/client');
            console.log('getAllClients response:', response);
            return response;
        } catch (error) {
            console.error('Error fetching clients:', error);
            if (error.response) {
                console.error('Error response data:', error.response.data);
                throw error.response.data.message || 'Error fetching clients';
            }
            throw error.message || 'Error fetching clients';
        }
    },

    // Get clients for a specific team
    getTeamClients: async (teamId) => {
        try {
            console.log(`Fetching clients for team ${teamId}`);
            const response = await api.get(`/client/team/${teamId}`);
            console.log('getTeamClients response:', response);
            return response;
        } catch (error) {
            console.error(`Error fetching clients for team ${teamId}:`, error);
            if (error.response) {
                console.error('Error response data:', error.response.data);
                throw error.response.data.message || 'Error fetching team clients';
            }
            throw error.message || 'Error fetching team clients';
        }
    },

    // Get a specific client by ID
    getClientById: async (clientId) => {
        try {
            console.log(`Fetching client ${clientId}`);
            const response = await api.get(`/client/${clientId}`);
            console.log('getClientById response:', response);
            return response;
        } catch (error) {
            console.error(`Error fetching client ${clientId}:`, error);
            if (error.response) {
                console.error('Error response data:', error.response.data);
                throw error.response.data.message || 'Error fetching client details';
            }
            throw error.message || 'Error fetching client details';
        }
    },

    // Update a client
    updateClient: async (clientId, clientData) => {
        try {
            console.log(`Updating client ${clientId} with data:`, clientData);
            const response = await api.patch(`/client/${clientId}`, clientData);
            console.log('updateClient response:', response);
            return response;
        } catch (error) {
            console.error(`Error updating client ${clientId}:`, error);
            if (error.response) {
                console.error('Error response data:', error.response.data);
                throw error.response.data.message || 'Error updating client';
            }
            throw error.message || 'Error updating client';
        }
    },

    // Delete a client
    deleteClient: async (clientId) => {
        try {
            console.log(`Deleting client ${clientId}`);
            const response = await api.delete(`/client/${clientId}`);
            console.log('deleteClient response:', response);
            return response;
        } catch (error) {
            console.error(`Error deleting client ${clientId}:`, error);
            if (error.response) {
                console.error('Error response data:', error.response.data);
                throw error.response.data.message || 'Error deleting client';
            }
            throw error.message || 'Error deleting client';
        }
    }
};

export default clientService; 