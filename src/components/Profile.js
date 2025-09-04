import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import driverService from '../services/driverService';
import { 
  FaCheckCircle, 
  FaHourglassHalf, 
  FaTimesCircle, 
  FaInfoCircle, 
  FaEdit, 
  FaPhone, 
  FaEnvelope, 
  FaIdCard, 
  FaCar, 
  FaHistory,
  FaSignOutAlt,
  FaTaxi,
  FaMapMarkerAlt,
  FaStar,
  FaCarSide
} from 'react-icons/fa';
import { motion } from 'framer-motion';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [taxiStatus, setTaxiStatus] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const navigate = useNavigate();

  // Status configuration with enhanced styling
  const statusConfig = {
    pending: {
      icon: <FaHourglassHalf className="text-yellow-500" />,
      bg: 'from-yellow-50 to-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-200',
      label: 'Under Review',
      description: 'Your taxi registration is under review. We\'ll notify you once it\'s processed.',
    },
    approved: {
      icon: <FaCheckCircle className="text-green-500" />,
      bg: 'from-green-50 to-green-100',
      text: 'text-green-800',
      border: 'border-green-200',
      label: 'Approved',
      description: 'Your taxi registration has been approved! You can now accept rides.',
    },
    rejected: {
      icon: <FaTimesCircle className="text-red-500" />,
      bg: 'from-red-50 to-red-100',
      text: 'text-red-800',
      border: 'border-red-200',
      label: 'Rejected',
      description: 'Your registration was rejected. Please check the reason below.',
    },
    default: {
      icon: <FaInfoCircle className="text-blue-500" />,
      bg: 'from-blue-50 to-blue-100',
      text: 'text-blue-800',
      border: 'border-blue-200',
      label: 'Not Registered',
      description: 'You have not registered your taxi yet.',
    }
  };

  const status = taxiStatus?.status || 'default';
  const currentStatus = statusConfig[status] || statusConfig.default;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        let userData = localStorage.getItem('user');
        if (userData) {
          userData = JSON.parse(userData);
        } else {
          const response = await authService.getCurrentUser();
          userData = response.data.user;
          localStorage.setItem('user', JSON.stringify(userData));
        }

        // Ensure role is always array
        if (userData.role && !Array.isArray(userData.role)) {
          userData.role = [userData.role];
        }

        setUser(userData);

        if (userData.role?.includes('driver')) {
          await fetchTaxiStatus();
        }
      } catch (err) {
        console.error('Profile fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchTaxiStatus = async () => {
      try {
        const response = await driverService.getTaxiStatus();
        if (response?.data) {
          const statusData = response.data.data || response.data;
          setTaxiStatus({
            status: statusData.status?.toLowerCase() || 'unknown',
            vehicleNumber: statusData.vehicleNumber || 'N/A',
            vehicleModel: statusData.vehicleModel || 'N/A',
            rejectionReason: statusData.rejectionReason || null
          });
        }
      } catch (err) {
        console.error('Error fetching taxi status:', err);
        if (err.response?.status !== 404) {
          // Handle error if needed
        }
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Taxi Themed Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl shadow-xl mb-8"
        >
          {/* Taxi Pattern Background */}
          <div className="absolute inset-0 bg-yellow-400">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS13aWR0aD0iMC41IiBzdHlsZT0ib3BhY2l0eTowLjE7Ij48cGF0aCBkPSJNMTkgN2gtMVY2YTIgMiAwIDAwLTItMkg4YTIgMiAwIDAwLTIgMnYxS1h2OWgydjFhMiAyIDAgMTA0IDB2LTFoOHYxYTIgMiAwIDEwNCAtMHYtMWgydi05aC0xem0tOCA5aC0xdi0yaDF2MnptMC0zaC0xdi0yaDF2MnptMC0zaC0xVjhoMXYyem0zIDZoLTF2LTJoMXYyem0wLTNoLTF2LTJoMXYyem0wLTNoLTFWOmgxdjJ6bTMgN2gtMXYtMmgxdjJ6bTAtM2gtMXYtMmgxdjJ6bTAtM2gtMXYtMmgxdjJ6Ii8+PC9zdmc+')] opacity-10"></div>
          </div>
          
          <div className="relative z-10 p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center">
              <div className="relative">
                <div className="h-24 w-24 md:h-32 md:w-32 rounded-full bg-white p-1 shadow-xl border-4 border-white">
                  <div className="h-full w-full rounded-full bg-blue-600 flex items-center justify-center text-4xl text-white font-bold">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-yellow-400 p-2 rounded-full shadow-lg">
                  {currentStatus.icon}
                </div>
              </div>
              
              <div className="mt-6 md:mt-0 md:ml-8 text-center md:text-left">
                <h1 className="text-2xl md:text-4xl font-bold text-gray-900">{user?.name || 'User'}</h1>
                <div className="flex items-center justify-center md:justify-start mt-2">
                  <FaCarSide className="text-yellow-600 mr-2" />
                  <span className="text-gray-700">Premium Member</span>
                </div>
                
                <div className={`mt-4 inline-flex items-center px-4 py-2 rounded-full ${currentStatus.border} border ${currentStatus.text} bg-white/90 backdrop-blur-sm text-sm font-medium shadow-sm`}>
                  <span className="mr-2">{currentStatus.icon}</span>
                  {currentStatus.label}
                </div>
                
                <p className="mt-3 text-sm text-gray-700 max-w-md">
                  {currentStatus.description}
                </p>
              </div>
              
              <div className="mt-6 md:mt-0 md:ml-auto flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <button 
                  onClick={() => navigate('/edit-profile')}
                  className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent rounded-full text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <FaEdit className="mr-2" />
                  Edit Profile
                </button>
                <button 
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent rounded-full text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <FaSignOutAlt className="mr-2" />
                  Logout
                </button>
              </div>
            </div>
          </div>
          
          {/* Decorative Taxi Elements */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-black/10 backdrop-blur-sm flex items-center px-8">
            <div className="flex items-center space-x-6 text-sm text-white/90">
              <div className="flex items-center">
                <FaTaxi className="text-yellow-400 mr-2" />
                <span>Taxi ID: {user?._id?.substring(0, 8) || 'N/A'}</span>
              </div>
              <div className="flex items-center">
                <FaStar className="text-yellow-400 mr-2" />
                <span>4.9/5 (128 rides)</span>
              </div>
              <div className="flex items-center">
                <FaMapMarkerAlt className="text-yellow-400 mr-2" />
                <span>Mumbai, India</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {['profile', 'documents', 'vehicle', 'history'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {activeTab === 'profile' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Personal Information */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-gray-900">Personal Information</h2>
                  <button className="text-blue-600 hover:text-blue-800">
                    <FaEdit />
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <FaIdCard className="text-gray-400 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="text-gray-900">{user?.name || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FaEnvelope className="text-gray-400 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">Email Address</p>
                      <p className="text-gray-900">{user?.email || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FaPhone className="text-gray-400 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">Phone Number</p>
                      <p className="text-gray-900">{user?.phone || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Taxi Information */}
              {user?.role?.includes('driver') && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium text-gray-900">Taxi Information</h2>
                    <button className="text-blue-600 hover:text-blue-800">
                      <FaEdit />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <FaCar className="text-gray-400 mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500">Vehicle Number</p>
                        <p className="text-gray-900">{taxiStatus?.vehicleNumber || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <FaCar className="text-gray-400 mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500">Vehicle Model</p>
                        <p className="text-gray-900">{taxiStatus?.vehicleModel || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <FaInfoCircle className="text-gray-400 mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <div className="flex items-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            status === 'approved' 
                              ? 'bg-green-100 text-green-800' 
                              : status === 'rejected' 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {currentStatus.label}
                          </span>
                        </div>
                      </div>
                    </div>
                    {status === 'rejected' && taxiStatus?.rejectionReason && (
                      <div className="mt-4 p-3 bg-red-50 rounded-lg">
                        <p className="text-sm text-red-700">
                          <span className="font-medium">Rejection Reason:</span> {taxiStatus.rejectionReason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'documents' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl shadow-sm p-6"
            >
              <h2 className="text-lg font-medium text-gray-900 mb-6">Documents</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {['Driving License', 'Vehicle RC', 'Insurance', 'PUC', 'Fitness Certificate', 'Permit'].map((doc) => (
                  <div key={doc} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-50 rounded-lg mr-3">
                        <FaIdCard className="text-blue-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{doc}</p>
                        <p className="text-sm text-gray-500">
                          {doc === 'Driving License' ? 'Expires: 2025-12-31' : 'Not uploaded'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                        {doc === 'Driving License' ? 'View' : 'Upload'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl shadow-sm overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Ride History</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {[1, 2, 3].map((ride) => (
                  <div key={ride} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          <span className="font-medium text-gray-900">Ride #{1000 + ride}</span>
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Completed
                          </span>
                        </div>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <span>26 Aug 2023 • 14:30</span>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-700">
                          <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                          Connaught Place, New Delhi
                        </div>
                        <div className="mt-1 flex items-center text-sm text-gray-700">
                          <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                          Indira Gandhi International Airport
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">₹{450 + (ride * 50)}</p>
                        <div className="mt-1 flex items-center justify-end">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <FaStar 
                              key={star} 
                              className={`h-4 w-4 ${star <= 4 ? 'text-yellow-400' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
