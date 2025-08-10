import axiosInstance from './api';

// We can't import handleApiError directly since we need to create it
const handleApiError = (error) => {
    console.error('API Error:', error);

    if (error.response) {
        return {
            status: 'ERROR',
            message: error.response.data?.message || 'An error occurred',
        };
    } else if (error.request) {
        return {
            status: 'ERROR',
            message: 'Network error: Could not connect to the server',
        };
    } else {
        return {
            status: 'ERROR',
            message: 'An unexpected error occurred',
        };
    }
};

// Get all developers working under a manager's teams
export const getManagerDevelopers = async () => {
    try {
        console.log('Calling manager-developers API endpoint');
        const response = await axiosInstance.get('/user/manager-developers');
        console.log('API response:', response);
        return response;
    } catch (error) {
        console.error('Error in getManagerDevelopers:', error);
        return handleApiError(error);
    }
}; 