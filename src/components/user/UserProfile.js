import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { getMyTaxi } from '../../services/taxiService';
import { toast } from 'react-toastify';

const UserProfile = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [taxi, setTaxi] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTaxiStatus = async () => {
      try {
        const { data } = await getMyTaxi(token);
        setTaxi(data);
      } catch (error) {
        console.error('Error fetching taxi status:', error);
        if (error.response?.status !== 404) {
          toast.error('Failed to load taxi status');
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchTaxiStatus();
    }
  }, [user, token]);

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Approved' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' },
    };

    const statusInfo = statusMap[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Not Registered' };

    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusInfo.bg} ${statusInfo.text}`}>
        {statusInfo.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">User Profile</h1>
            <p className="text-gray-600">Manage your account and taxi information</p>
          </div>
          
          {taxi?.isApproved && (
            <Link
              to="/driver/dashboard"
              className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Go to Driver Dashboard
            </Link>
          )}
        </div>

        <div className="space-y-6">
          {/* User Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Name</p>
                <p className="mt-1 text-sm text-gray-900">{user?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="mt-1 text-sm text-gray-900">{user?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Phone</p>
                <p className="mt-1 text-sm text-gray-900">{user?.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Role</p>
                <p className="mt-1 text-sm text-gray-900 capitalize">
                  {user?.roles?.join(', ') || 'User'}
                </p>
              </div>
            </div>
          </div>

          {/* Taxi Information */}
          {taxi ? (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Taxi Information</h2>
                <div>{getStatusBadge(taxi.status)}</div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Driver Name</p>
                  <p className="mt-1 text-sm text-gray-900">{taxi.driverName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Vehicle Number</p>
                  <p className="mt-1 text-sm text-gray-900">{taxi.vehicleNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Vehicle Model</p>
                  <p className="mt-1 text-sm text-gray-900">{taxi.vehicleModel || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Vehicle Type</p>
                  <p className="mt-1 text-sm text-gray-900 capitalize">{taxi.vehicleType || 'N/A'}</p>
                </div>
                {taxi.status === 'rejected' && taxi.rejectionReason && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-gray-500">Rejection Reason</p>
                    <p className="mt-1 text-sm text-red-600">{taxi.rejectionReason}</p>
                  </div>
                )}
              </div>
              
              {taxi.status === 'pending' && (
                <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        Your taxi registration is under review. You'll be notified once it's approved.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-gray-600 mb-4">You haven't registered a taxi yet.</p>
              <button
                onClick={() => navigate('/register-taxi')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Register Your Taxi
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
