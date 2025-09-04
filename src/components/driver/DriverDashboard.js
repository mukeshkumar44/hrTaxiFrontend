import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  FiClock, 
  FiCheckCircle, 
  FiDollarSign, 
  FiUser, 
  FiMapPin,
  FiStar,
  FiNavigation,
  FiCalendar,
  FiX,
  FiClock as FiClockIcon
} from 'react-icons/fi';
import { FaTaxi, FaMoneyBillWave, FaCarAlt, FaBusAlt, FaPhone, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { API_ENDPOINTS } from '../../config/api';
import { io } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';
import RideRequests from './RideRequests';
import driverService from '../../services/driverService';
import { apiClient } from "../../services/api";

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

const DriverDashboard = () => {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(() => {
    return localStorage.getItem('driverOnline') === 'true';
  });
  const [socket, setSocket] = useState(null);
  const [position, setPosition] = useState([20.5937, 78.9629]);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [rideRequests, setRideRequests] = useState([]);
  const [showRideRequest, setShowRideRequest] = useState(false);
  const [currentRideRequest, setCurrentRideRequest] = useState(null);
  const [activeTab, setActiveTab] = useState('taxi');
  const [isLoading, setIsLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);

  // Fetch driver's bookings
  const fetchBookings = useCallback(async () => {
    try {
      console.log('Fetching driver bookings...');
      setIsLoading(true);
      const response = await driverService.getBookings();
      console.log('Bookings response:', response);
      
      if (response.success) {
        console.log('Bookings data:', response.data);
        setBookings(Array.isArray(response.data) ? response.data : []);
      } else {
        console.error('Failed to fetch bookings:', response.message);
        toast.error(response.message || 'Failed to load bookings');
        setBookings([]);
      }
    } catch (error) {
      console.error('Error in fetchBookings:', error);
      toast.error('An error occurred while fetching bookings');
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch bookings on component mount
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Toggle online status
  const toggleOnlineStatus = async (status) => {
    try {
      setIsLoading(true);
      const response = await driverService.updateDriverAvailability(status);
      
      if (response.success) {
        setIsOnline(status);
        localStorage.setItem('driverOnline', status);
        toast.success(`You are now ${status ? 'online' : 'offline'}`);
        
        // If going online, fetch fresh bookings
        if (status) {
          await fetchBookings();
        }
      } else {
        toast.error(response.message || 'Failed to update status');
        // Revert the toggle if the API call fails
        const currentStatus = localStorage.getItem('driverOnline') === 'true';
        setIsOnline(currentStatus);
      }
    } catch (error) {
      console.error('Error toggling online status:', error);
      toast.error('Failed to update online status');
      // Revert the toggle on error
      const currentStatus = localStorage.getItem('driverOnline') === 'true';
      setIsOnline(currentStatus);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize WebSocket connection
  const initializeWebSocket = useCallback(() => {
    if (!user?._id) return;
    
    const socketUrl = process.env.REACT_APP_WS_URL || 'http://localhost:5000';
    const socketInstance = io(socketUrl, {
      auth: {
        token: localStorage.getItem('token'),
        userId: user._id,
        userType: 'driver'
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    // Connection established
    socketInstance.on('connect', () => {
      console.log('WebSocket connected');
      setSocket(socketInstance);
    });

    // Connection error
    socketInstance.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      toast.error('Connection error. Please check your internet connection.');
    });

    // Handle incoming ride requests via WebSocket
    const handleNewRideRequest = (rideRequest) => {
      console.log('New ride request received:', rideRequest);
      
      // Update ride requests list
      setRideRequests(prev => {
        // Check if this request already exists
        const exists = prev.some(req => req._id === rideRequest._id);
        if (!exists) {
          return [...prev, rideRequest];
        }
        return prev;
      });
      
      // Always show the latest request
      setCurrentRideRequest(rideRequest);
      setShowRideRequest(true);
      
      // Play notification sound
      const audio = new Audio('/notification.mp3');
      audio.play().catch(e => console.log('Audio play failed:', e));
    };

    // Handle ride accepted by another driver
    const handleRideAccepted = (data) => {
      console.log('Ride accepted by another driver:', data);
      
      // Remove this ride from our requests if it was accepted by someone else
      setRideRequests(prev => 
        prev.filter(req => req._id !== data.bookingId)
      );
      
      // Close the modal if it's the same ride
      if (currentRideRequest?._id === data.bookingId) {
        setShowRideRequest(false);
      }
    };

    // Set up event listeners
    socketInstance.on('newRideRequest', handleNewRideRequest);
    socketInstance.on('rideAccepted', handleRideAccepted);

    // Handle disconnection
    socketInstance.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      if (reason === 'io server disconnect') {
        // The disconnection was initiated by the server, try to reconnect
        socketInstance.connect();
      }
    });

    // Clean up on unmount
    return () => {
      if (socketInstance) {
        socketInstance.off('connect');
        socketInstance.off('connect_error');
        socketInstance.off('newRideRequest', handleNewRideRequest);
        socketInstance.off('rideAccepted', handleRideAccepted);
        socketInstance.off('disconnect');
        socketInstance.disconnect();
      }
    };
  }, [user?._id, currentBooking]);

  // Initialize WebSocket when component mounts and driver is online
  useEffect(() => {
    if (isOnline && !socket) {
      initializeWebSocket();
    }
    
    return () => {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    };
  }, [isOnline, initializeWebSocket]);

  // Add this effect to check driver's online status on component mount
  useEffect(() => {
    const checkOnlineStatus = async () => {
      try {
        const response = await driverService.getProfile();
        if (response.success && response.data) {
          const isDriverOnline = response.data.isOnline || false;
          setIsOnline(isDriverOnline);
          localStorage.setItem('driverOnline', isDriverOnline);
        }
      } catch (error) {
        console.error('Error fetching driver status:', error);
      }
    };

    checkOnlineStatus();
  }, []);

  // Handle accepting a ride request
  const handleAcceptRide = async (request) => {
    try {
      setIsLoading(true);
      
      // Get current driver location
      if (!currentLocation) {
        toast.error('Could not get your current location. Please enable location services.');
        return;
      }
      
      const response = await driverService.acceptRideRequest(request._id, {
        lat: currentLocation.lat,
        lng: currentLocation.lng
      });
      
      if (response.success) {
        // Set the current booking
        setCurrentBooking(response.data);
        // Remove from ride requests
        setRideRequests(prev => prev.filter(req => req._id !== request._id));
        // Close the modal
        setShowRideRequest(false);
        
        // Start tracking ride status
        setupRideStatusTracking(response.data._id);
        
        toast.success('Ride accepted successfully!');
      } else {
        toast.error(response.message || 'Failed to accept ride');
      }
    } catch (error) {
      console.error('Error accepting ride:', error);
      toast.error('An error occurred while accepting the ride');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle rejecting a ride request
  const handleRejectRide = async (request) => {
    try {
      setIsLoading(true);
      const response = await driverService.rejectRideRequest(request._id);
      
      if (response.success) {
        // Remove from ride requests
        setRideRequests(prev => prev.filter(req => req._id !== request._id));
        // Close the modal if this was the current request
        if (currentRideRequest?._id === request._id) {
          setShowRideRequest(false);
        }
        
        toast.info('Ride request declined');
      } else {
        toast.error(response.message || 'Failed to decline ride');
      }
    } catch (error) {
      console.error('Error rejecting ride:', error);
      toast.error('An error occurred while declining the ride');
    } finally {
      setIsLoading(false);
    }
  };

  // Set up WebSocket listeners for ride status updates
  const setupRideStatusTracking = useCallback((bookingId) => {
    if (!socket) return;

    const handleRideStatusUpdate = (data) => {
      console.log('Ride status update:', data);
      
      if (data.bookingId === bookingId) {
        // Update current booking status
        setCurrentBooking(prev => ({
          ...prev,
          status: data.status,
          ...(data.driverLocation && { driverLocation: data.driverLocation })
        }));

        // Handle specific status updates
        if (data.status === 'completed' || data.status === 'cancelled') {
          // Clean up when ride is completed or cancelled
          setCurrentBooking(null);
          // Refresh bookings list
          fetchBookings();
        }
      }
    };

    socket.on('rideStatusUpdate', handleRideStatusUpdate);

    // Clean up on unmount
    return () => {
      if (socket) {
        socket.off('rideStatusUpdate', handleRideStatusUpdate);
      }
    };
  }, [socket, fetchBookings]);

  // Handle completing a ride
  const handleCompleteRide = async (bookingId) => {
    try {
      setIsLoading(true);
      const response = await apiClient.put(`/driver/bookings/${bookingId}/complete`);
      console.log("Ride completed:", response.data);
      fetchBookings(); // refresh list
      setCurrentBooking(null); // Clear current booking
      toast.success('Ride completed successfully!');
    } catch (error) {
      console.error("Error completing ride:", error);
      toast.error(error.response?.data?.message || 'Failed to complete ride');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 relative">
      {/* Header */}
      <header className="bg-white shadow relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Driver Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
            <button
              onClick={() => toggleOnlineStatus(!isOnline)}
              className={`px-4 py-2 rounded-md font-medium flex items-center ${isOnline ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-600 text-white hover:bg-green-700'}`}
            >
              {isOnline ? (
                <>
                  <FaToggleOn className="mr-2" /> Go Offline
                </>
              ) : (
                <>
                  <FaToggleOff className="mr-2" /> Go Online
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-0 max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Bookings */}
          <div className="lg:col-span-1 space-y-6">
            {/* Stats Cards */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Summary</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-blue-600">Total Rides</p>
                  <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-green-600">Earnings</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{bookings.reduce((sum, booking) => sum + (parseFloat(booking.fare) || 0), 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Bookings List */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
              </div>
              <div className="divide-y divide-gray-200 max-h-[500px] overflow-y-auto">
                {isLoading ? (
                  <div className="p-4 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-500">Loading bookings...</p>
                  </div>
                ) : bookings.length > 0 ? (
                  bookings.map((booking) => (
                    <div key={booking._id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">
                            {booking.pickupLocation?.address?.split(',')[0] || 'Pickup Location'}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            <FiMapPin className="inline mr-1" />
                            {booking.dropLocation?.address?.split(',')[0] || 'Drop Location'}
                          </p>
                        </div>
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          {booking.status || 'Pending'}
                        </span>
                      </div>
                      <div className="mt-2 flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900">₹{booking.fare || '0'}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(booking.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center">
                    <FaCarAlt className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings yet</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {isOnline ? 'Waiting for new ride requests...' : 'Go online to receive ride requests'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content - Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow overflow-hidden h-full">
              <div className="h-[500px] w-full">
                <MapContainer
                  center={position}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                  zoomControl={false}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  {currentBooking && (
                    <Marker position={currentBooking.pickupLocation.coordinates}>
                      <Popup>Pickup Location</Popup>
                    </Marker>
                  )}
                  {currentBooking?.dropLocation?.coordinates && (
                    <Marker position={currentBooking.dropLocation.coordinates}>
                      <Popup>Drop-off Location</Popup>
                    </Marker>
                  )}
                  <Marker position={position}>
                    <Popup>Your Location</Popup>
                  </Marker>
                </MapContainer>
              </div>
              
              {/* Current Ride Info */}
              {currentBooking && (
                <div className="p-4 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Current Ride</h3>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <div className="h-2 w-2 rounded-full bg-blue-500 mt-2"></div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-gray-500">Pickup</p>
                        <p className="text-gray-900">{currentBooking.pickupLocation?.address || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-0.5 bg-gray-300 ml-0.5"></div>
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-gray-500">Drop-off</p>
                        <p className="text-gray-900">{currentBooking.dropLocation?.address || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="pt-2">
                      <button
                        onClick={() => handleCompleteRide(currentBooking._id)}
                        className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                      >
                        Complete Ride
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Ride Request Modal */}
      {showRideRequest && currentRideRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900">New Ride Request</h3>
                <button 
                  onClick={() => setShowRideRequest(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <FiMapPin className="h-5 w-5 text-green-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Pickup</p>
                    <p className="font-medium">{currentRideRequest.pickupLocation?.address || 'Location not specified'}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <FiMapPin className="h-5 w-5 text-red-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Drop-off</p>
                    <p className="font-medium">{currentRideRequest.dropoffLocation?.address || 'Location not specified'}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <FiDollarSign className="h-5 w-5 text-yellow-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Fare</p>
                    <p className="font-medium">₹{currentRideRequest.fare || 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="mt-6 flex space-x-4">
                <button
                  onClick={() => handleRejectRide(currentRideRequest)}
                  disabled={isLoading}
                  className="flex-1 py-3 px-4 border border-red-500 rounded-lg text-red-600 hover:bg-red-50 font-medium disabled:opacity-50 flex items-center justify-center"
                >
                  <FiX className="mr-2" /> Reject
                </button>
                <button
                  onClick={() => handleAcceptRide(currentRideRequest)}
                  disabled={isLoading}
                  className="flex-1 py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 flex items-center justify-center"
                >
                  <FiCheckCircle className="mr-2" /> Accept
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverDashboard;
