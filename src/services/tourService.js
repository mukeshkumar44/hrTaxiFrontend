import { apiClient } from './api';
import { API_ENDPOINTS } from '../config/api';

const tourService = {
   getUserTourBookings: async () => {
    const res = await apiClient.get('/bookings/tour/my-bookings');
    console.log('Raw tour response:', res);
    return res.data.data; // <- यहाँ देखो कि res.data मौजूद है
  },

  // Get tour package by ID
  getTourPackageById: async (id) => {
    try {
      console.log('Fetching tour package by ID:', id);
      console.log('API Endpoint:', `${API_ENDPOINTS.TOUR_PACKAGES}/${id}`);
      const response = await apiClient.get(`${API_ENDPOINTS.TOUR_PACKAGES}/${id}`);
      console.log('Tour package response:', response);
      return response.data;
    } catch (error) {
      console.error(`Error fetching tour package ${id}:`, {
        message: error.message,
        response: error.response?.data,
        config: error.config
      });
      throw error;
    }
  },

  // Book a tour
  bookTour: async (bookingData) => {
    try {
      console.log('1. Starting bookTour with data:', JSON.stringify(bookingData, null, 2));
      
      // Use the API client with the correct endpoint
      const response = await apiClient.post(API_ENDPOINTS.BOOK_TOUR, bookingData);
      
      console.log('2. Request successful. Response:', {
        status: response.status,
        data: response.data
      });
      
      return response.data;
      
    } catch (error) {
      console.error('Error in bookTour:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        responseData: error.response?.data,
        request: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data ? JSON.parse(error.config.data) : null,
          headers: error.config?.headers
        }
      });
      
      const errorMessage = error.response?.data?.message || 'Failed to book tour. Please try again.';
      const errorToThrow = new Error(errorMessage);
      errorToThrow.status = error.response?.status;
      throw errorToThrow;
    }
  },

  // Get user's tour bookings
  getUserTourBookings: async () => {
    try {
      console.log('Fetching user tour bookings...');
      console.log('Using API Endpoint:', API_ENDPOINTS.MY_TOUR_BOOKINGS);
      
      const response = await apiClient.get(API_ENDPOINTS.MY_TOUR_BOOKINGS);
      console.log('Raw API Response:', response);
      
      if (!response.data) {
        console.error('No data in response');
        return [];
      }
      
      // Handle different response formats
      const bookings = response.data.data || response.data;
      
      if (!Array.isArray(bookings)) {
        console.error('Unexpected response format:', response.data);
        return [];
      }
      
      return bookings;
      
    } catch (error) {
      console.error('Error in getUserTourBookings:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
        config: error.config
      });
      return [];
    }
  },

  // Cancel a tour booking
  cancelTourBooking: async (bookingId) => {
    try {
      console.log('Cancelling tour booking with ID:', bookingId);
      console.log('API Endpoint:', `${API_ENDPOINTS.TOUR_BOOKINGS}/${bookingId}`);
      const response = await apiClient.delete(`${API_ENDPOINTS.TOUR_BOOKINGS}/${bookingId}`);
      console.log('Cancellation successful:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error cancelling booking ${bookingId}:`, {
        message: error.message,
        response: error.response?.data,
        config: error.config
      });
      throw error;
    }
  },

  // Update booking status (for admin)
  updateBookingStatus: async (bookingId, status) => {
    try {
      console.log('Updating booking status for booking ID:', bookingId);
      console.log('API Endpoint:', `${API_ENDPOINTS.TOUR_BOOKINGS}/${bookingId}/status`);
      console.log('New status:', status);
      const response = await apiClient.patch(
        `${API_ENDPOINTS.TOUR_BOOKINGS}/${bookingId}/status`,
        { status }
      );
      console.log('Update successful:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating booking ${bookingId} status:`, {
        message: error.message,
        response: error.response?.data,
        config: error.config
      });
      throw error;
    }
  },

  // Get current driver's tour booking
  getDriverTourBooking: async () => {
    try {
      console.log('Fetching driver tour booking');
      console.log('API Endpoint:', API_ENDPOINTS.DRIVER_TOUR_BOOKING);
      const response = await apiClient.get(API_ENDPOINTS.DRIVER_TOUR_BOOKING);
      console.log('Driver tour booking response:', response);
      return response.data;
    } catch (error) {
      console.error('Error fetching driver tour booking:', {
        message: error.message,
        response: error.response?.data,
        config: error.config
      });
      throw error;
    }
  }
};

export default tourService;