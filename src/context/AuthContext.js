// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { authService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import apiClient from '../config/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Function to update user data
  const updateUser = useCallback((userData) => {
    if (userData) {
      setCurrentUser(prevUser => ({
        ...prevUser,
        ...userData
      }));
      // Also update in localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...user, ...userData }));
    }
  }, []);

  // Login function
  const login = useCallback(async (credentials) => {
    try {
      // Clear any existing auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete apiClient.defaults.headers.common['Authorization'];
      
      // Perform login
      const { token, user } = await authService.login(credentials);
      
      if (token && user) {
        // Set new auth data
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Update state
        setCurrentUser(user);
        
        // Redirect based on role
        const role = user.role || (user.roles?.includes('admin') ? 'admin' : 
                                 user.roles?.includes('driver') ? 'driver' : 'user');
        
        navigate(role === 'admin' ? '/admin/dashboard' : 
                role === 'driver' ? '/driver/dashboard' : '/dashboard', 
                { replace: true });
        
        return { success: true };
      }
      
      throw new Error('Login failed: No token or user data received');
      
    } catch (error) {
      console.error('Login error:', error);
      setCurrentUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return { success: false, error: error.message };
    }
  }, [navigate]);

  // Logout function
  const logout = useCallback(() => {
    // Clear axios default headers
    delete apiClient.defaults.headers.common['Authorization'];
    
    // Clear storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Reset state
    setCurrentUser(null);
    
    // Redirect to login
    navigate('/login', { replace: true });
    
    // Force a small delay to ensure state is cleared
    setTimeout(() => {
      window.location.reload();
    }, 100);
  }, [navigate]);

  // Check authentication status
  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        // First set the user from localStorage for immediate UI update
        setCurrentUser(JSON.parse(storedUser));
        
        // Then verify the token and get fresh user data
        try {
          const response = await authService.getCurrentUser();
          if (response?.user) {
            setCurrentUser(response.user);
            localStorage.setItem('user', JSON.stringify(response.user));
          }
        } catch (error) {
          console.error('Error refreshing user data:', error);
          // Don't log out if we can't refresh, use the stored user data
        }
      } else {
        setCurrentUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setCurrentUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, []);

  // Initial auth check
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const value = {
    currentUser,
    loading,
    initialized,
    login,
    logout,
    updateUser,
    isAuthenticated: !!currentUser,
    isAdmin: currentUser?.roles?.includes('admin') || currentUser?.role === 'admin',
    isDriver: currentUser?.roles?.includes('driver') || currentUser?.role === 'driver'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
