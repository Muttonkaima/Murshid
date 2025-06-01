import axios from 'axios';

export const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    // Skip token addition only for specific auth routes that don't require authentication
    const publicAuthRoutes = [
      '/auth/login',
      '/auth/signup',
      '/auth/forgot-password',
      '/auth/reset-password/',
      '/auth/google',
      '/auth/google/callback',
      '/auth/check-email',
      '/auth/send-otp',
      '/auth/verify-otp',
      '/auth/setup-password'
    ];

    // Only skip token addition for specific public auth routes
    const isPublicRoute = publicAuthRoutes.some(route => 
      config.url?.startsWith(route)
    );

    if (isPublicRoute) {
      return config;
    }
    
    // For all other routes, add the token
    if (typeof document !== 'undefined') {
      // First try to get token from cookies
      const cookieToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];
      
      // If not in cookies, try localStorage
      const storageToken = localStorage.getItem('token');
      
      // Use the token from cookies if available, otherwise use the one from localStorage
      const token = cookieToken || storageToken;
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Added token to request headers');
      } else {
        console.warn('No authentication token found');
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isPasswordUpdateEndpoint = error.config?.url?.includes('/auth/update-my-password');
    
    if (error.response?.status === 401) {
      console.error('Authentication error:', error.response?.data?.message || 'Unauthorized');
      
      // For password update endpoint, don't log out on 401 - just reject the promise
      if (isPasswordUpdateEndpoint) {
        return Promise.reject({
          ...error,
          message: error.response?.data?.message || 'The current password is incorrect',
          status: error.response?.status
        });
      }
      
      // For other 401 errors, handle as before (redirect to login)
      if (!window.location.pathname.includes('/login')) {
        // Store the current URL to redirect back after login
        const redirectUrl = window.location.pathname + window.location.search;
        sessionStorage.setItem('redirectAfterLogin', redirectUrl);
        
        // Clear auth data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Redirect to login
        window.location.href = '/login';
      }
    }
    
    // Return a rejected promise with the error
    return Promise.reject({
      ...error,
      message: error.response?.data?.message || error.message || 'An error occurred',
      status: error.response?.status
    });
  }
);

export default api;
