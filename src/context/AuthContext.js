// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/api';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await authService.getCurrentUser();
          const user = response?.user || null;
          
          if (user) {
            setCurrentUser(user);

            // Redirect if already logged in and user is on login/signup
            if (['/login', '/signup', '/register'].includes(window.location.pathname)) {
              const role = user.role || (user.roles?.includes('admin') ? 'admin' : 
                                      user.roles?.includes('driver') ? 'driver' : 'user');
              
              if (role === 'admin') {
                navigate('/admin/dashboard', { replace: true });
              } else if (role === 'driver') {
                navigate('/driver/dashboard', { replace: true });
              } else {
                navigate('/dashboard', { replace: true });
              }
            }
          } else {
            // If no valid user data, clear the invalid token
            localStorage.removeItem('token');
            localStorage.removeItem('user');
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
    };

    checkAuth();
  }, [navigate]);

  // ---------------- Login ----------------
  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      const token = response.token || (response.data && response.data.token);
      const user = response.user || (response.data && response.data.user);
      
      if (token && user) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setCurrentUser(user); // This will trigger a re-render

        // Redirect based on role
        const role = user.role || (user.roles?.includes('admin') ? 'admin' : 
                               user.roles?.includes('driver') ? 'driver' : 'user');
      
        navigate(role === 'admin' ? '/admin/dashboard' : 
              role === 'driver' ? '/driver/dashboard' : '/');
      
        return { success: true, user };
      }
      throw new Error('No token or user data received');
    } catch (error) {
      console.error('Login error:', error);
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
      
      // Force a hard redirect to the login page
      window.location.href = '/login';
      
      // Force a reload to ensure all state is cleared
      window.location.reload();
    }
  };

  // ---------------- Helpers ----------------
  const isAdmin = () => {
    const user = currentUser || JSON.parse(localStorage.getItem('user'));
    return user?.role === 'admin' || user?.roles?.includes('admin');
  };

  const isDriver = () => {
    const user = currentUser || JSON.parse(localStorage.getItem('user'));
    return user?.role === 'driver' || user?.roles?.includes('driver');
  };

  const value = {
    currentUser,
    loading,
    initialized,
    login,
    logout,
    isAdmin,
    isDriver,
    isAuthenticated: !!currentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
