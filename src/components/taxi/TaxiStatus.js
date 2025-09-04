import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getTaxiStatus } from '../../services/taxiService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const TaxiStatus = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [taxi, setTaxi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    let roleCheckInterval = null;

    const checkTaxiStatus = async () => {
      try {
        const response = await getTaxiStatus();
        
        if (!isMounted) return;
        
        if (response.success) {
          setTaxi(response.data);
          
          // If taxi is approved, check user role
          if (response.data.status === 'approved') {
            await handleApprovedTaxi();
          }
        } else {
          setError(response.message || 'Failed to fetch taxi status');
        }
      } catch (error) {
        console.error('Error in checkTaxiStatus:', error);
        if (isMounted) {
          setError('An error occurred while checking taxi status');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const handleApprovedTaxi = async () => {
      try {
        // First, refresh user data
        const updatedUser = await refreshUser();
        
        if (!isMounted) return;
        
        // Check if user has driver role (support both string and array formats)
        const hasDriverRole = Array.isArray(updatedUser?.role) 
          ? updatedUser.role.includes('driver')
          : updatedUser?.role === 'driver';
        
        if (hasDriverRole) {
          toast.success('Taxi approved! Redirecting to driver dashboard...');
          navigate('/driver/dashboard', { replace: true });
          return;
        }
        
        // If not a driver yet, start polling for role update
        startRolePolling();
      } catch (error) {
        console.error('Error in handleApprovedTaxi:', error);
        toast.error('Error updating your account. Please log in again.');
      }
    };

    const startRolePolling = async () => {
      let attempts = 0;
      const maxAttempts = 5;
      
      const checkRole = async () => {
        if (!isMounted || attempts >= maxAttempts) {
          if (attempts >= maxAttempts) {
            toast.info('Please log in again to access driver features');
          }
          return;
        }
        
        attempts++;
        console.log(`Checking user role (attempt ${attempts}/${maxAttempts})`);
        
        try {
          const refreshedUser = await refreshUser();
          
          if (!isMounted) return;
          
          // Check if user has driver role (support both string and array formats)
          const hasDriverRole = Array.isArray(refreshedUser?.role) 
            ? refreshedUser.role.includes('driver')
            : refreshedUser?.role === 'driver';
          
          if (hasDriverRole) {
            toast.success('Taxi approved! Redirecting to driver dashboard...');
            navigate('/driver/dashboard', { replace: true });
          } else {
            // Check again after delay if not a driver yet
            roleCheckInterval = setTimeout(checkRole, 2000);
          }
        } catch (err) {
          console.error('Error in checkRole:', err);
          if (isMounted) {
            roleCheckInterval = setTimeout(checkRole, 2000);
          }
        }
      };
      
      // Initial check
      checkRole();
    };

    // Initial status check
    checkTaxiStatus();

    // Cleanup function
    return () => {
      isMounted = false;
      if (roleCheckInterval) {
        clearTimeout(roleCheckInterval);
      }
    };
  }, [navigate, refreshUser]);

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
        {status?.toUpperCase() || 'UNKNOWN'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-sm text-center max-w-md w-full">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Taxi Registration Status</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Current status of your taxi registration
            </p>
          </div>
          
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-gray-200">
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {getStatusBadge(taxi?.status || 'pending')}
                </dd>
              </div>
              
              {taxi?.rejectionReason && (
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Rejection Reason</dt>
                  <dd className="mt-1 text-sm text-red-600 sm:mt-0 sm:col-span-2">
                    {taxi.rejectionReason}
                  </dd>
                </div>
              )}
              
              {taxi && (
                <>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Driver Name</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {taxi.driverName}
                    </dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Vehicle Number</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-mono">
                      {taxi.vehicleNumber}
                    </dd>
                  </div>
                </>
              )}
            </dl>
          </div>
          
          <div className="bg-gray-50 px-4 py-4 sm:px-6 flex justify-between">
            {taxi?.status === 'rejected' && (
              <Link
                to="/register-taxi"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Re-apply for Taxi Registration
              </Link>
            )}
            
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Refresh Status
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxiStatus;