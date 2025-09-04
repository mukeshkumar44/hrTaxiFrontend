import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedDriverRoute = ({ children }) => {
  const { currentUser, initialized } = useAuth();
  const location = useLocation();

  // Debug logs
  useEffect(() => {
    console.log('ProtectedDriverRoute - currentUser:', currentUser);
    console.log('ProtectedDriverRoute - pathname:', location.pathname);
  }, [currentUser, location]);

  // Show loading state while auth is initializing
  if (!initialized) {
    console.log('Auth not yet initialized, showing loading...');
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600">Loading driver dashboard...</p>
      </div>
    );
  }

  // Check if user has driver role (support both string and array formats)
  const hasDriverRole = currentUser && (
    Array.isArray(currentUser.role)
      ? currentUser.role.includes('driver')
      : currentUser.role === 'driver'
  );

  // If not authenticated, redirect to login
  if (!currentUser) {
    console.log('No current user, redirecting to login');
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // If user doesn't have driver role, redirect to home or unauthorized page
  if (!hasDriverRole) {
    console.log('User does not have driver role, redirecting');
    return <Navigate to="/unauthorized" state={{ from: location.pathname }} replace />;
  }

  // If user is authenticated and has driver role, render the children
  return children;
};

export default ProtectedDriverRoute;
