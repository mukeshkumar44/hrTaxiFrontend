import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

const registerTaxi = async (formData) => {
  try {
    const response = await axios.post(API_ENDPOINTS.TAXI_REGISTER, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Taxi registration error:', error);
    throw error;
  }
};

const getTaxiStatus = async () => {
  try {
    const response = await axios.get(API_ENDPOINTS.TAXI_REGISTRATION_STATUS, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      params: { _: Date.now() } // Prevent caching
    });

    // Ensure consistent response structure
    if (response.data && response.data.success) {
      return {
        success: true,
        data: response.data.data || response.data
      };
    }

    return {
      success: false,
      message: response.data?.message || 'Failed to fetch taxi status'
    };
  } catch (error) {
    console.error('Error in getTaxiStatus:', error);
    
    // Handle different types of errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      return {
        success: false,
        status: error.response.status,
        message: error.response.data?.message || 'Server error occurred'
      };
    } else if (error.request) {
      // The request was made but no response was received
      return {
        success: false,
        message: 'No response from server. Please check your connection.'
      };
    } else {
      // Something happened in setting up the request that triggered an Error
      return {
        success: false,
        message: error.message || 'Error setting up request'
      };
    }
  }
};

export { registerTaxi, getTaxiStatus };
