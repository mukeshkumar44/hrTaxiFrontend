import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import { API_ENDPOINTS } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { FaCar, FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaIdCard, FaUpload, FaCheckCircle, FaExclamationCircle, FaInfoCircle } from 'react-icons/fa';
import apiClient, { API_ENDPOINTS } from "../../config/api";
const TaxiRegistration = () => {
  const navigate = useNavigate();
  const { user, updateUser, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [status, setStatus] = useState(null);
  const [formData, setFormData] = useState({
    driverName: '',
    vehicleNumber: '',
    vehicleModel: '',
    licenseNumber: '',
    phoneNumber: '',
    email: '',
    address: '',
    vehicleType: 'sedan'
  });

  const [files, setFiles] = useState({
    vehiclePhoto: null,
    preview: null
  });

  const [registrationStatus, setRegistrationStatus] = useState({
    isSubmitted: false,
    isApproved: false,
    isRejected: false,
    message: '',
    status: null // 'pending', 'approved', 'rejected'
  });

  const vehicleTypes = [
    { value: 'sedan', label: 'Sedan', icon: '🚗' },
    { value: 'suv', label: 'SUV', icon: '🚙' },
    { value: 'hatchback', label: 'Hatchback', icon: '🚗' },
    { value: 'luxury', label: 'Luxury', icon: '🏎️' }
  ];

  const steps = [
    { id: '1', name: 'Personal Info' },
    { id: '2', name: 'Vehicle Details' },
    { id: '3', name: 'Documents' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFiles(prev => ({
      ...prev,
      [name]: files[0]
    }));
  };

  const validateForm = () => {
    // Check required text fields
    const requiredFields = [
      'driverName', 'phoneNumber', 'email', 'address', 
      'vehicleNumber', 'vehicleModel', 'licenseNumber'
    ];
    
    for (const field of requiredFields) {
      if (!formData[field]?.trim()) {
        toast.error(`${field.replace(/([A-Z])/g, ' $1').trim()} is required`);
        return false;
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    // Validate phone number (10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      toast.error('Please enter a valid 10-digit phone number');
      return false;
    }

    // Check vehicle photo is required
    if (!files.vehiclePhoto) {
      toast.error('Please upload vehicle photo');
      return false;
    }

    return true;
  };

  useEffect(() => {
    const checkRegistration = async () => {
      try {
        const response = await apiClient.get(API_ENDPOINTS.TAXI_REGISTRATION_STATUS);
        
        if (response.data?.data?.status === 'approved') {
          navigate('/driver/dashboard');
        } else if (response.data?.data?.status) {
          setRegistrationStatus({
            isSubmitted: true,
            status: response.data.data.status,
            message: getStatusMessage(response.data.data.status)
          });
        }
      } catch (error) {
        console.error('Error checking registration status:', error);
      }
    };
    
    if (user?.role === 'driver') {
      navigate('/driver/dashboard');
    } else {
      checkRegistration();
    }
  }, [user, navigate]);

  const getStatusMessage = (status) => {
    switch (status) {
      case 'pending':
        return 'Your taxi registration is under review. We will notify you once it\'s processed.';
      case 'approved':
        return 'Your taxi has been approved! Redirecting to dashboard...';
      case 'rejected':
        return 'Your registration was rejected. Please contact support for more information.';
      default:
        return 'Your registration is being processed.';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const formDataToSend = new FormData();
      
      // Add all form fields to formData
      formDataToSend.append('driverName', formData.driverName);
      formDataToSend.append('vehicleNumber', formData.vehicleNumber);
      formDataToSend.append('vehicleModel', formData.vehicleModel);
      formDataToSend.append('licenseNumber', formData.licenseNumber);
      formDataToSend.append('phoneNumber', formData.phoneNumber);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('vehicleType', formData.vehicleType);
      
      if (files.vehiclePhoto) {
        formDataToSend.append('vehiclePhoto', files.vehiclePhoto);
      }

      const response = await apiClient.post(API_ENDPOINTS.TAXI_REGISTER, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        const status = response.data.data?.status || 'pending';
        const message = getStatusMessage(status);
        
        setRegistrationStatus({
          isSubmitted: true,
          status,
          message
        });
        
        if (status === 'approved') {
          await updateUser({ ...user, role: 'driver' });
          setTimeout(() => navigate('/driver/dashboard'), 2000);
        } else if (status === 'pending') {
          startStatusPolling(status);
        }
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startStatusPolling = (initialStatus) => {
    const maxAttempts = 20; // 20 attempts * 5 seconds = 100 seconds max
    let attempts = 0;
    
    const poll = async () => {
      if (attempts >= maxAttempts) {
        setRegistrationStatus(prev => ({
          ...prev,
          message: 'Status check timed out. Please check back later or contact support.'
        }));
        return;
      }
      
      attempts++;
      
      try {
        const response = await apiClient.get(API_ENDPOINTS.TAXI_REGISTRATION_STATUS);
        console.log("Registration status:", response.data);
        setStatus(response.data);
      

        if (response.data.success) {
          const { status } = response.data.data || {};
          const message = getStatusMessage(status);
          
          setRegistrationStatus({
            isSubmitted: true,
            status,
            message
          });
          
          if (status === 'approved') {
            await updateUser(await refreshUser());
            setTimeout(() => navigate('/driver/dashboard'), 2000);
            return;
          } else if (status === 'rejected') {
            return;
          }
          
          // Continue polling if still pending
          setTimeout(poll, 5000);
        }
      } catch (error) {
        console.error('Error checking registration status:', error);
        setTimeout(poll, 5000);
      }
    };

    // Start polling after initial delay
    setTimeout(poll, 5000);
  };

  const renderStatusBanner = () => {
    if (!registrationStatus.isSubmitted) return null;
    
    let bgColor = 'bg-blue-50';
    let textColor = 'text-blue-800';
    let icon = null;
    
    switch(registrationStatus.status) {
      case 'approved':
        bgColor = 'bg-green-50';
        textColor = 'text-green-800';
        icon = <FaCheckCircle className="h-5 w-5 text-green-400" />;
        break;
      case 'rejected':
        bgColor = 'bg-red-50';
        textColor = 'text-red-800';
        icon = <FaExclamationCircle className="h-5 w-5 text-red-400" />;
        break;
      default:
        icon = <FaInfoCircle className="h-5 w-5 text-blue-400" />;
    }
    
    return (
      <div className={`${bgColor} rounded-md p-4 mb-6`}>
        <div className="flex">
          <div className="flex-shrink-0">
            {icon}
          </div>
          <div className="ml-3">
            <h3 className={`text-sm font-medium ${textColor}`}>
              {registrationStatus.status === 'pending' ? 'Registration Submitted' : 
               registrationStatus.status === 'approved' ? 'Registration Approved!' : 
               'Registration Status'}
            </h3>
            <div className={`mt-2 text-sm ${textColor}`}>
              <p>{registrationStatus.message}</p>
            </div>
            {registrationStatus.status === 'pending' && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full animate-pulse" style={{width: '45%'}}></div>
                </div>
                <p className="mt-1 text-xs text-gray-500">This may take a few moments...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            {registrationStatus.isSubmitted ? 'Registration Status' : 'Join Our Fleet'}
          </h1>
          <p className="mt-3 text-xl text-gray-600">
            {registrationStatus.isSubmitted 
              ? 'Your registration details are being processed' 
              : 'Register your taxi and start earning with us today!'}
          </p>
        </div>

        {/* Status Banner */}
        {registrationStatus.isSubmitted && renderStatusBanner()}

        {/* Only show form if not submitted or if there was an error */}
        {(!registrationStatus.isSubmitted || registrationStatus.status === 'error') && (
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
            <form onSubmit={handleSubmit} className="divide-y divide-gray-200">
              {/* Step 1: Personal Information */}
              {activeStep === 1 && (
                <div className="px-6 py-8 sm:p-10">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <FaUser className="mr-2 text-blue-600" /> Personal Information
                  </h2>
                  
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-6">
                      <label htmlFor="driverName" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaUser className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="driverName"
                          id="driverName"
                          value={formData.driverName}
                          onChange={handleInputChange}
                          className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 py-3 sm:text-sm border-gray-300 rounded-md"
                          placeholder="John Doe"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaPhone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          name="phoneNumber"
                          id="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleInputChange}
                          className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 py-3 sm:text-sm border-gray-300 rounded-md"
                          placeholder="9876543210"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaEnvelope className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 py-3 sm:text-sm border-gray-300 rounded-md"
                          placeholder="you@example.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-6">
                      <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 mb-1">
                        licenseNumber <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaUser className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="licenseNumber"
                          id="licenseNumber"
                          value={formData.licenseNumber}
                          onChange={handleInputChange}
                          className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 py-3 sm:text-sm border-gray-300 rounded-md"
                          placeholder="John Doe"
                        />
                      </div>
                    </div>
                    </div>
                    <div className="sm:col-span-6">
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                        Address <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute top-3 left-3">
                          <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
                        </div>
                        <textarea
                          name="address"
                          id="address"
                          rows={3}
                          value={formData.address}
                          onChange={handleInputChange}
                          className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 py-3 sm:text-sm border-gray-300 rounded-md"
                          placeholder="Your complete address"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setActiveStep(2)}
                      className="ml-3 inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Next: Vehicle Details
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Vehicle Details */}
              {activeStep === 2 && (
                <div className="px-6 py-8 sm:p-10">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <FaCar className="mr-2 text-blue-600" /> Vehicle Information
                  </h2>
                  
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <label htmlFor="vehicleNumber" className="block text-sm font-medium text-gray-700 mb-1">
                        Vehicle Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="vehicleNumber"
                        id="vehicleNumber"
                        value={formData.vehicleNumber}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="DL 01 AB 1234"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="vehicleModel" className="block text-sm font-medium text-gray-700 mb-1">
                        Vehicle Model <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="vehicleModel"
                        id="vehicleModel"
                        value={formData.vehicleModel}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Swift Dzire"
                      />
                    </div>

                    <div className="sm:col-span-6">
                      <label htmlFor="vehicleType" className="block text-sm font-medium text-gray-700 mb-1">
                        Vehicle Type <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-1 grid grid-cols-2 gap-4 sm:grid-cols-4">
                        {vehicleTypes.map((type) => (
                          <div
                            key={type.value}
                            onClick={() => setFormData({...formData, vehicleType: type.value})}
                            className={`relative rounded-lg border-2 p-4 flex flex-col items-center cursor-pointer transition-all ${formData.vehicleType === type.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                          >
                            <span className="text-2xl mb-2">{type.icon}</span>
                            <span className="text-sm font-medium text-gray-900">{type.label}</span>
                            {formData.vehicleType === type.value && (
                              <div className="absolute top-0 right-0 -mt-2 -mr-2">
                                <div className="bg-blue-500 rounded-full p-1">
                                  <FaCheckCircle className="h-4 w-4 text-white" />
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setActiveStep(1)}
                      className="inline-flex justify-center py-2 px-6 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveStep(3)}
                      className="ml-3 inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Next: Documents
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Documents */}
              {activeStep === 3 && (
                <div className="px-6 py-8 sm:p-10">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <FaIdCard className="mr-2 text-blue-600" /> Document Upload
                  </h2>
                  
                  <div className="space-y-6">
                    <div>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                          <div className="flex text-sm text-gray-600">
                            <label
                              htmlFor="vehiclePhoto"
                              className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                            >
                              <span>Upload Vehicle Photo</span>
                              <input
                                id="vehiclePhoto"
                                name="vehiclePhoto"
                                type="file"
                                className="sr-only"
                                onChange={(e) => {
                                  handleFileChange(e);
                                  if (e.target.files && e.target.files[0]) {
                                    setFiles(prev => ({
                                      ...prev,
                                      preview: URL.createObjectURL(e.target.files[0])
                                    }));
                                  }
                                }}
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, GIF up to 10MB
                          </p>
                        </div>
                      </div>
                      {files.preview && (
                        <div className="mt-4 flex justify-center">
                          <div className="relative">
                            <img
                              src={files.preview}
                              alt="Vehicle preview"
                              className="h-40 rounded-lg object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setFiles({ vehiclePhoto: null, preview: null });
                                document.getElementById('vehiclePhoto').value = '';
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-blue-800">Requirements</h3>
                      <ul className="mt-2 text-sm text-blue-700 list-disc list-inside space-y-1">
                        <li>Clear photo of your vehicle showing the license plate</li>
                        <li>All four sides of the vehicle should be visible</li>
                        <li>Good lighting conditions</li>
                        <li>No other vehicles in the frame</li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setActiveStep(2)}
                      className="inline-flex justify-center py-2 px-6 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="ml-3 inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/20000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        'Submit Application'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaxiRegistration;
