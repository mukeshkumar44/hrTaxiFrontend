import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';

const RegistrationStatus = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [registration, setRegistration] = useState(null);

  useEffect(() => {
    const fetchRegistrationStatus = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.TAXI_REGISTRATION_STATUS, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.data.success) {
          setRegistration(response.data.data);
        } else {
          throw new Error(response.data.message || 'Failed to fetch registration status');
        }
      } catch (error) {
        console.error('Error fetching registration status:', error);
        toast.error(error.response?.data?.message || 'Failed to load registration status');
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrationStatus();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Taxi Registration Status</h1>
        
        {registration ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Registration ID:</span>
              <span className="text-gray-700">{registration._id}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="font-medium">Vehicle Number:</span>
              <span className="text-gray-700">{registration.vehicleNumber}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="font-medium">Status:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(registration.status)}`}>
                {registration.status.toUpperCase()}
              </span>
            </div>
            
            {registration.status === 'rejected' && registration.rejectionReason && (
              <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500">
                <p className="font-medium text-red-800">Reason for rejection:</p>
                <p className="text-red-700">{registration.rejectionReason}</p>
              </div>
            )}
            
            {registration.status === 'pending' && (
              <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500">
                <p className="text-blue-800">
                  Your registration is under review. Please check back later for updates.
                </p>
              </div>
            )}
            
            <div className="mt-8 flex justify-end">
              <button
                onClick={() => navigate('/driver/dashboard')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">No registration found.</p>
            <button
              onClick={() => navigate('/taxi/register')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Register Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistrationStatus;
