import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

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
    console.log('Token from localStorage:', token);
    if (token) {
      console.log('Adding token to headers');
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('Request headers after adding token:', config.headers);
    } else {
      console.warn('No token found in localStorage');
    }
    return config;
  },
  error => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
apiClient.interceptors.response.use(
  response => {
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  error => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      requestData: error.config?.data,  // Log the request data that caused the error
      headers: error.config?.headers    // Log request headers for debugging
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
    console.log('Login request data before sending:', JSON.stringify(credentials, null, 2));
    try {
      const response = await apiClient.post('/users/login', {
        email: credentials?.email?.trim() || '',
        password: credentials?.password || ''
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Login successful - Full response:', {
        status: response.status,
        headers: response.headers,
        data: response.data,
        user: response.data?.user,
        token: response.data?.token,
        role: response.data?.user?.role
      });
      
      // Save token and user data to localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        console.log('Token saved to localStorage');
      } else if (response.data.data?.token) {
        // Handle case where token is nested in data object
        localStorage.setItem('token', response.data.data.token);
        console.log('Token (nested) saved to localStorage');
      }
      
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      } else if (response.data.data?.user) {
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
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
      console.error('Error getting current user:', {
        status: error.response?.status,
        message: error.message
      });
      
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
    console.log('Updating taxi status:', { id, status, rejectionReason });
    const requestData = { 
      status,
      ...(status === 'rejected' && rejectionReason && { rejectionReason })
    };
    console.log('Sending request data:', requestData);
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
      console.log('Fetching dashboard stats...');
      const response = await apiClient.get('/admin/dashboard');
      console.log('Dashboard stats response:', response.data);
      return response;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
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
      console.error('Error fetching taxi status:', error);
      throw error;
    }
  },
  registerTaxi: async (taxiData) => {
    try {
      const response = await apiClient.post('/taxis/register', taxiData);
      return response.data;
    } catch (error) {
      console.error('Error registering taxi:', error);
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