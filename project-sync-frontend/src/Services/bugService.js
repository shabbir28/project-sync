import api from './api';
import axios from 'axios';
import { API_URL } from '../config';

// Set up axios defaults
axios.defaults.withCredentials = true;

// Helper function to create API response
const createResponse = (status, message, data = null) => {
    return {
        status,
        message,
        data,
    };
};

// Get all bugs (for managers)
export const getAllBugs = async () => {
    try {
        console.log('Calling getAllBugs API');
        const response = await api.get('/bug');
        console.log('getAllBugs response:', response);
        return response;
    } catch (error) {
        console.error('Error fetching all bugs:', error);
        return { status: 'ERROR', message: 'Failed to fetch bugs' };
    }
};

// Get bugs assigned to the logged-in developer
export const getAssignedBugs = async () => {
    try {
        console.log('Calling getAssignedBugs API');
        const response = await api.get('/bug');
        console.log('getAssignedBugs response:', response);

        // Better handling of response format
        if (!response || response.status === 'ERROR') {
            console.error('Error in getAssignedBugs response:', response);
            return {
                status: 'ERROR',
                message: response?.message || 'Failed to fetch assigned bugs',
                bugs: []
            };
        }

        return response;
    } catch (error) {
        console.error('Error fetching assigned bugs:', error);
        return {
            status: 'ERROR',
            message: error.message || 'Failed to fetch assigned bugs',
            bugs: []
        };
    }
};

// Get a single bug by ID
export const getBugById = async (bugId) => {
    try {
        console.log(`Calling getBugById API for bug: ${bugId}`);
        const response = await api.get(`/bug/${bugId}`);
        console.log(`getBugById response for bug ${bugId}:`, response);
        return response;
    } catch (error) {
        console.error(`Error fetching bug ${bugId}:`, error);
        return { status: 'ERROR', message: 'Failed to fetch bug details' };
    }
};

// Create a new bug
export const createBug = async (bugData) => {
    try {
        console.log('Calling createBug API with data:', bugData);
        const response = await api.post('/bug', bugData);
        console.log('createBug response:', response);
        return response;
    } catch (error) {
        console.error('Error creating bug:', error);
        return {
            status: 'ERROR',
            message: error.message || 'Failed to create bug'
        };
    }
};

// Update an existing bug
export const updateBug = async (bugId, bugData) => {
    try {
        console.log(`Calling updateBug API for bug ${bugId} with data:`, bugData);
        const response = await api.patch(`/bug/${bugId}`, bugData);
        console.log(`updateBug response for bug ${bugId}:`, response);
        return response;
    } catch (error) {
        console.error(`Error updating bug ${bugId}:`, error);
        return { status: 'ERROR', message: 'Failed to update bug' };
    }
};

// Update just the status of a bug (for developers to mark as complete)
export const updateBugStatus = async (bugId, status) => {
    try {
        console.log(`Calling updateBugStatus API for bug ${bugId} with status:`, status);
        const response = await api.patch(`/bug/${bugId}`, { status });
        console.log(`updateBugStatus response for bug ${bugId}:`, response);

        // Better handling of response format
        if (!response || response.status === 'ERROR') {
            console.error(`Error in updateBugStatus response for bug ${bugId}:`, response);
            return {
                status: 'ERROR',
                message: response?.message || 'Failed to update bug status',
            };
        }

        return response;
    } catch (error) {
        console.error(`Error updating bug status for ${bugId}:`, error);
        return {
            status: 'ERROR',
            message: error.message || 'Failed to update bug status'
        };
    }
};

// Delete a bug
export const deleteBug = async (bugId) => {
    try {
        console.log(`Calling deleteBug API for bug ${bugId}`);
        const response = await api.delete(`/bug/${bugId}`);
        console.log(`deleteBug response for bug ${bugId}:`, response);
        return response;
    } catch (error) {
        console.error(`Error deleting bug ${bugId}:`, error);
        return { status: 'ERROR', message: 'Failed to delete bug' };
    }
};

// Get bugs for a specific project
export const getProjectBugs = async (projectId) => {
    try {
        console.log(`Calling getProjectBugs API for project ${projectId}`);
        const response = await api.get(`/project/${projectId}/bugs`);
        console.log(`getProjectBugs response for project ${projectId}:`, response);
        return response;
    } catch (error) {
        console.error(`Error fetching bugs for project ${projectId}:`, error);
        return { status: 'ERROR', message: 'Failed to fetch project bugs' };
    }
}; 