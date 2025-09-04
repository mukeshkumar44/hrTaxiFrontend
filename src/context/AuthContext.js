// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { authService } from '../services/api';
import { useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../config/api'; // Updated import path to point to the correct location

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
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

  // Check authentication status
  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await authService.getCurrentUser();
        const user = response?.user || null;
        
        if (user) {
          setCurrentUser(user);
          localStorage.setItem('user', JSON.stringify(user));
          
          // Redirect if on auth pages
          if (['/login', '/signup', '/register'].includes(location.pathname)) {
            const role = user.role || (user.roles?.includes('admin') ? 'admin' : 
                                    user.roles?.includes('driver') ? 'driver' : 'user');
            
            navigate(role === 'admin' ? '/admin/dashboard' : 
                    role === 'driver' ? '/driver/dashboard' : '/dashboard', 
                    { replace: true });
          }
        } else {
          // If no valid user data, clear the invalid token
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setCurrentUser(null);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setCurrentUser(null);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, [navigate, location.pathname]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // ---------------- Login ----------------
  const login = async (credentials) => {
    try {
      const { token, user } = await authService.login(credentials);
      
      if (token && user) {
        // Update state and storage
        setCurrentUser(user);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Set up axios default headers
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Redirect based on role
        const role = user.role || (user.roles?.includes('admin') ? 'admin' : 
                                 user.roles?.includes('driver') ? 'driver' : 'user');
        
        // Small delay to ensure state is updated
        setTimeout(() => {
          navigate(role === 'admin' ? '/admin/dashboard' : 
                  role === 'driver' ? '/driver/dashboard' : '/', 
                  { replace: true });
        }, 100);
        
        return { success: true, user };
      }
      
      throw new Error('Login failed: No user data received');
      
    } catch (error) {
      console.error('Login error in AuthContext:', error);
      // Clear any partial auth data on error
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setCurrentUser(null);
      throw error;
    }
  };

  // ---------------- Logout ----------------
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all auth related data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setCurrentUser(null);
      
      // Navigate to login and force a reload
      navigate('/login', { replace: true });
      window.location.reload();
    }
  };

  // Listen for storage events to sync tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'user') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [checkAuth]);

  const value = {
    currentUser,
    loading,
    initialized,
    login,
    logout,
    updateUser,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
