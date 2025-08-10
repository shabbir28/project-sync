import { toast } from 'react-toastify';

/**
 * Handle API errors in a consistent way
 * @param {Object} error - The error object from the API call
 */
export const handleApiError = (error) => {
    console.error('API Error:', error);

    // Display appropriate error message
    if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const statusCode = error.response.status;
        const errorMessage = error.response.data?.message || 'An error occurred';

        // Handle specific status codes
        switch (statusCode) {
            case 401:
                toast.error('Authentication error: Please log in again');
                break;
            case 403:
                toast.error('Access denied: You do not have permission for this action');
                break;
            case 404:
                toast.error('Resource not found');
                break;
            case 500:
                toast.error('Server error: Please try again later');
                break;
            default:
                toast.error(errorMessage);
        }
    } else if (error.request) {
        // The request was made but no response was received
        toast.error('Network error: Could not connect to the server');
    } else {
        // Something happened in setting up the request that triggered an Error
        toast.error('An unexpected error occurred');
    }
}; 