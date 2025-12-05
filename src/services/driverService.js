// driverService.js
import apiClient from '../config/api';
import { API_ENDPOINTS } from '../config/api';

// Helper function to handle API responses
const handleResponse = (response) => {
  return {
    success: true,
    data: response.data,
    status: response.status
  };
};

// Helper function to handle errors
const handleError = (error) => {
  if (error.response) {
    // Server responded with a status other than 2xx
    console.error('API Error:', {
      status: error.response.status,
      data: error.response.data,
      headers: error.response.headers
    });
    return {
      success: false,
      status: error.response.status,
      message: error.response.data?.message || 'An error occurred',
      data: error.response.data
    };
  } else if (error.request) {
    // Request was made but no response received
    console.error('No response received:', error.request);
    return {
      success: false,
      message: 'No response from server. Please check your connection.'
    };
  } else {
    // Something happened in setting up the request
    console.error('Request error:', error.message);
    return {
      success: false,
      message: error.message || 'An error occurred'
    };
  }
};

const driverService = {
  // Get driver's profile
  getProfile: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PROFILE);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
  
  // Get driver's current ride
  getCurrentRide: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.DRIVER_CURRENT_RIDE);
      return handleResponse(response);
    } catch (error) {
      if (error.response?.status === 404) {
        return {
          success: true,
          data: null,
          message: 'No active ride found'
        };
      }
      return handleError(error);
    }
  },

  // Get driver's bookings
  getBookings: async (status = '') => {
    try {
      const params = status ? { status } : {};
      const response = await apiClient.get(API_ENDPOINTS.DRIVER_BOOKINGS, { params });
      return handleResponse({
        ...response,
        data: Array.isArray(response.data?.data || response.data) ? (response.data?.data || response.data) : []
      });
    } catch (error) {
      if (error.response?.status === 404) {
        return {
          success: true,
          data: [],
          message: 'No bookings found'
        };
      }
      return handleError(error);
    }
  },

  // Create a new booking
  createBooking: async (bookingData) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.BOOK_TOUR, bookingData);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // Update booking status
   // Update booking status
updateBookingStatus: async (bookingId, status) => {
  try {
    const response = await apiClient.patch(
      `/driver/bookings/${bookingId}/status`,
      { status }
    );
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
},

  // Update driver's location
  updateLocation: async (location) => {
    try {
      const response = await apiClient.put(API_ENDPOINTS.PROFILE, { 
        location: {
          type: 'Point',
          coordinates: [location.lng, location.lat]
        }
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // Update driver's online status
  updateDriverAvailability: async (isOnline) => {
    try {
      const response = await apiClient.post(
        isOnline ? '/driver/online' : '/driver/offline',
        {}
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // Get online status
  getOnlineStatus: async () => {
    try {
      const response = await apiClient.get('/driver/me');
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // Get all online drivers
  getOnlineDrivers: async () => {
    try {
      const response = await apiClient.get('/driver/online');
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // Get driver's earnings
  getEarnings: async (period = 'today') => {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.PROFILE}/earnings`, {
        params: { period }
      });
      return handleResponse({
        ...response,
        data: response.data || { amount: 0, currency: 'INR' }
      });
    } catch (error) {
      if (error.response?.status === 404) {
        return {
          success: true,
          data: { amount: 0, currency: 'INR' }
        };
      }
      return handleError(error);
    }
  },

  // Accept a ride request
  acceptRideRequest: async (bookingId, driverLocation) => {
    try {
      const response = await apiClient.post(
        `/bookings/${bookingId}/accept`,
        { driverLocation }
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // Reject a ride request
  rejectRideRequest: async (bookingId) => {
    try {
      const response = await apiClient.post(
        `/bookings/${bookingId}/reject`,
        {}
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
};

export default driverService;
