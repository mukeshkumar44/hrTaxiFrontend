import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://hrtaxibackend.onrender.com/api';

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    console.error('Request error:', error.message);
    return Promise.reject(error);
  }
);

// Add response interceptor
apiClient.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    const errorMessage = error.response?.data?.message || error.message;
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: errorMessage
    });
    return Promise.reject(error);
  }
);

// API services
export const bookingService = {
  getBookings: () => apiClient.get('/bookings/my-bookings'),
  getBookingById: (id) => apiClient.get(`/bookings/status/${id}`),
  createBooking: (bookingData) => apiClient.post('/bookings', bookingData),
  updateBookingStatus: (id, status) => apiClient.patch(`/bookings/${id}/status`, { status }),
  cancelBooking: (id) => apiClient.delete(`/bookings/${id}`)
};

export const contactService = {
  sendMessage: (contactData) => apiClient.post('/contact', contactData)
};

export const authService = {
  register: (userData) => apiClient.post('/users/register', userData),
  login: async (credentials) => {
    try {
      const response = await apiClient.post('/users/login', {
        email: credentials?.email?.trim() || '',
        password: credentials?.password || ''
      });

      const responseData = response.data;
      
      // Handle different response structures
      let token, user;
      
      if (responseData.token) {
        // Case 1: Token at root level
        token = responseData.token;
        user = responseData.user;
      } else if (responseData.data?.token) {
        // Case 2: Token nested in data object
        token = responseData.data.token;
        user = responseData.data.user || responseData.data;
      } else if (responseData.accessToken) {
        // Case 3: Access token format
        token = responseData.accessToken;
        user = responseData.user || responseData;
      } else {
        // Case 4: Fallback to first available token
        const possibleTokenKeys = ['token', 'access_token', 'jwt'];
        for (const key of possibleTokenKeys) {
          if (responseData[key]) {
            token = responseData[key];
            user = responseData.user || responseData;
            break;
          }
        }
      }

      if (!token) {
        console.error('No token found in response:', responseData);
        throw new Error('No authentication token received from server');
      }

      // Save to localStorage
      localStorage.setItem('token', token);
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }

      return { token, user, data: responseData };
      
    } catch (error) {
      console.error('Login error:', error.message);
      throw error;
    }
  },
  getCurrentUser: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, user not authenticated');
        return { user: null };
      }

      const response = await apiClient.get('/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Handle different possible response structures
      const userData = response.data?.data || response.data?.user || response.data;
      
      if (userData) {
        // Ensure user has required role information
        if (!userData.role && userData.roles) {
          userData.role = userData.roles.includes('admin') ? 'admin' : 
                         userData.roles.includes('driver') ? 'driver' : 'user';
        }
        
        console.log('Current user data:', userData);
        return { user: userData };
      }
      
      return { user: null };
    } catch (error) {
      console.error('Error getting current user:', error.message);
      
      // Clear invalid token on 401
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        console.log('Cleared invalid token');
      }
      
      return { user: null };
    }
  },
  // OTP related endpoints
  sendOtp: (email) => apiClient.post('/users/send-otp', { email }),
  verifyOtp: (email, otp) => apiClient.post('/users/verify-otp', { email, otp }),
  resetPassword: (email, otp, newPassword) => 
    apiClient.post('/users/reset-password', { email, otp, newPassword })
};

// Admin service
export const adminService = {
  // Users management
  getAllUsers: () => apiClient.get('/admin/users'),
  getUserById: (id) => apiClient.get(`/admin/users/${id}`),
  updateUser: (id, userData) => apiClient.put(`/admin/users/${id}`, userData),
  deleteUser: (id) => apiClient.delete(`/admin/users/${id}`),
  
  // Bookings management
  getAllBookings: () => apiClient.get('/admin/bookings'),
  updateBooking: (id, bookingData) => apiClient.put(`/admin/bookings/${id}`, bookingData),
  deleteBooking: (id) => apiClient.delete(`/admin/bookings/${id}`),
  
  // Taxi management
  getAllTaxis: () => apiClient.get('/admin/taxis'),
  getTaxiById: (id) => apiClient.get(`/admin/taxis/${id}`),
  updateTaxiStatus: (id, status, rejectionReason = '') => {
    const requestData = { 
      status,
      ...(status === 'rejected' && rejectionReason && { rejectionReason })
    };
    return apiClient.patch(`/admin/taxis/${id}/status`, requestData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  },
  deleteTaxi: (id) => apiClient.delete(`/admin/taxis/${id}`),
  
  // Dashboard statistics
  getDashboardStats: async () => {
    try {
      const response = await apiClient.get('/admin/dashboard');
      return response;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error.message);
      throw error;
    }
  }
};

// Taxi service
export const taxiService = {
  getTaxiStatus: async () => {
    try {
      const response = await apiClient.get('/taxis/status');
      return response.data;
    } catch (error) {
      console.error('Error fetching taxi status:', error.message);
      throw error;
    }
  },
  registerTaxi: async (taxiData) => {
    try {
      const response = await apiClient.post('/taxis/register', taxiData);
      return response.data;
    } catch (error) {
      console.error('Error registering taxi:', error.message);
      throw error;
    }
  }
};

const apiServices = {
  bookingService,
  contactService,
  authService,
  adminService,
  taxiService
};

export default apiServices;