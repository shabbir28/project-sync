/**
 * Configuration file for the application
 * Contains environment-specific settings
 */

// API URL - will use environment variable in production or fallback to localhost
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Other global configuration settings can be added here
export const APP_NAME = 'ProjectSync';
export const APP_VERSION = '1.0.0';

// Authentication token storage key
export const TOKEN_KEY = 'token';
export const USER_KEY = 'user';

// Default pagination settings
export const DEFAULT_PAGE_SIZE = 10;

// Toast notification settings
export const TOAST_AUTO_CLOSE = 3000;
export const TOAST_POSITION = 'top-right'; 