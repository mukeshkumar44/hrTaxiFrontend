import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaTaxi, FaCheckCircle, FaHourglassHalf, FaTimesCircle, FaInfoCircle } from 'react-icons/fa';
import { taxiService } from '../services/api';

const TaxiStatus = () => {
  const [taxi, setTaxi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTaxiStatus = async () => {
      try {
        setLoading(true);
        const response = await taxiService.getTaxiStatus();
        setTaxi(response.data);
      } catch (err) {
        console.error('Error fetching taxi status:', err);
        setError(err.response?.data?.message || 'Failed to fetch taxi status');
      } finally {
        setLoading(false);
      }
    };

    fetchTaxiStatus();
  }, []);

  // Status configuration
  const statusConfig = {
    pending: {
      icon: <FaHourglassHalf className="text-yellow-500 text-3xl" />,
      bg: 'bg-yellow-50',
      text: 'text-yellow-800',
      border: 'border-yellow-200',
      label: 'Pending Review',
      description: 'Your taxi registration is under review. We\'ll notify you once it\'s processed.'
    },
    approved: {
      icon: <FaCheckCircle className="text-green-500 text-3xl" />,
      bg: 'bg-green-50',
      text: 'text-green-800',
      border: 'border-green-200',
      label: 'Approved',
      description: 'Your taxi registration has been approved! You can now accept rides.'
    },
    rejected: {
      icon: <FaTimesCircle className="text-red-500 text-3xl" />,
      bg: 'bg-red-50',
      text: 'text-red-800',
      border: 'border-red-200',
      label: 'Rejected',
      description: 'Your registration was not approved. Please check the reason and reapply.'
    },
    default: {
      icon: <FaInfoCircle className="text-blue-500 text-3xl" />,
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      border: 'border-blue-200',
      label: 'Not Registered',
      description: 'You have not registered your taxi yet.'
    }
  };

  const getStatusConfig = (status) => {
    return statusConfig[status?.toLowerCase()] || statusConfig.default;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const status = taxi?.status?.toLowerCase();
  const config = getStatusConfig(status);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Taxi Registration Status</h1>
          <p className="mt-2 text-sm text-gray-600">
            Check the status of your taxi registration
          </p>
        </div>

        <div className={`rounded-lg overflow-hidden shadow-lg ${config.bg} ${config.border} border-l-4`}>
          <div className="p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {config.icon}
              </div>
              <div className="ml-4">
                <h3 className={`text-lg font-medium ${config.text}`}>
                  {config.label}
                </h3>
                <div className="mt-2 text-sm text-gray-700">
                  <p>{config.description}</p>
                </div>
                
                {taxi && (
                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Taxi Number</dt>
                        <dd className="mt-1 text-sm text-gray-900">{taxi.vehicleNumber || 'N/A'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Model</dt>
                        <dd className="mt-1 text-sm text-gray-900">{taxi.vehicleModel || 'N/A'}</dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-sm font-medium text-gray-500">Driver Name</dt>
                        <dd className="mt-1 text-sm text-gray-900">{taxi.driverName || 'N/A'}</dd>
                      </div>
                      {taxi.rejectionReason && (
                        <div className="sm:col-span-2">
                          <dt className="text-sm font-medium text-red-700">Reason for Rejection</dt>
                          <dd className="mt-1 text-sm text-red-600">{taxi.rejectionReason}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 px-6 py-3 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-xs text-gray-500 mb-2 sm:mb-0">
              {taxi?.updatedAt 
                ? `Last updated: ${new Date(taxi.updatedAt).toLocaleString()}`
                : 'Status information'}
            </p>
            <div className="flex space-x-3">
              {status === 'rejected' && (
                <Link
                  to="/register-taxi"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  Reapply Now
                </Link>
              )}
              {!taxi && (
                <Link
                  to="/register-taxi"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Register Your Taxi
                </Link>
              )}
              <Link
                to="/driver/dashboard"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxiStatus;
