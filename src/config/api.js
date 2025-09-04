// frontend/src/config/api.js
import axios from 'axios';

// Get base URL from environment variables
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
console.log('API Base URL:', API_BASE_URL);

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Don't set Authorization header for login/register endpoints
    const isAuthEndpoint = ['/users/login', '/users/register'].some(endpoint => 
      config.url?.endsWith(endpoint)
    );

    if (!isAuthEndpoint) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    // For file uploads, remove the Content-Type header to let the browser set it
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    console.error('[API] Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // If there's a new token in the response, update it
    if (response.data?.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data on 401 Unauthorized
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Helper function to create endpoints without duplicating /api
const createEndpoint = (path) => {
  return path.startsWith('/') ? path : `/${path}`;
};

// API endpoints
export const API_ENDPOINTS = {
  // Base URL for direct usage when needed
  BASE_URL: API_BASE_URL,
  ACCEPT_RIDE_REQUEST: '/api/bookings/accept',
  REJECT_RIDE_REQUEST: '/api/bookings/reject',
  
  // Tours
  TOUR_PACKAGES: createEndpoint('tour-packages'),
  TOUR_PACKAGE_DETAILS: (id) => createEndpoint(`tour-packages/${id}`),
  BOOK_TOUR: createEndpoint('bookings/tour'),
  TOUR_BOOKINGS: createEndpoint('bookings/tour'),
  MY_TOUR_BOOKINGS: createEndpoint('bookings/tour/my-bookings'),
  CANCEL_TOUR_BOOKING: (id) => createEndpoint(`bookings/tour/${id}/cancel`),
  
  // Users
  USERS: createEndpoint('users'),
  LOGIN: createEndpoint('users/login'),
  REGISTER: createEndpoint('users/register'),
  PROFILE: createEndpoint('users/profile'),
  UPDATE_PROFILE: createEndpoint('users/profile'),
  CHANGE_PASSWORD: createEndpoint('users/change-password'),
  FORGOT_PASSWORD: createEndpoint('users/forgot-password'),
  RESET_PASSWORD: createEndpoint('users/reset-password'),
  // Taxi (👉 तुम्हें missing यही थे)
  TAXI_REGISTER: createEndpoint('taxis/register'),
  TAXI_REGISTRATION_STATUS: createEndpoint('taxis/status'),
 
  // Admin
  ADMIN_TOUR_PACKAGES: createEndpoint('admin/tour-packages'),
  ADMIN_TOUR_PACKAGE: (id) => createEndpoint(`admin/tour-packages/${id}`),
  
  // Driver
  DRIVER_BOOKINGS: createEndpoint('driver/bookings'),
  DRIVER_CURRENT_RIDE: createEndpoint('/bookings'),
  DRIVER_UPDATE_RIDE_STATUS: createEndpoint('/bookings'),
  DRIVER_CURRENT_TOUR: createEndpoint('/tour-bookings/'),
  DRIVER_UPDATE_TOUR_STATUS: createEndpoint('/tour-bookings'),
  
  // Gallery
  GALLERY: createEndpoint('gallery'),
  
  // Contact
  CONTACT: createEndpoint('contact'),
  
  // Uploads
  UPLOAD: createEndpoint('upload')
};

// Export both named and default exports
export { apiClient, createEndpoint };
export default apiClient;
