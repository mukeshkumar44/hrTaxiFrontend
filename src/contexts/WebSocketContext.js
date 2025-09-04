import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [driverLocation, setDriverLocation] = useState(null);
  const [activeBooking, setActiveBooking] = useState(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectTimeout = useRef(null);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!isAuthenticated || !user?._id) return;

    // Create socket connection
    const newSocket = io('wss://backendhrtaxi.onrender.com', {
      auth: { token: localStorage.getItem('token') },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    // Connection established
    newSocket.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      reconnectAttempts.current = 0;
      
      // Authenticate with the server
      newSocket.emit('authenticate', { 
        token: localStorage.getItem('token'),
        userId: user._id 
      });
    });

    // Handle disconnection
    newSocket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      setIsConnected(false);
      
      // Attempt to reconnect with exponential backoff
      if (reconnectAttempts.current < maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
        reconnectTimeout.current = setTimeout(() => {
          reconnectAttempts.current += 1;
          newSocket.connect();
        }, delay);
      }
    });

    // Handle connection error
    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
    });

    // Handle driver location updates
    newSocket.on('driverLocationUpdated', (data) => {
      setDriverLocation({
        lat: data.location.lat,
        lng: data.location.lng,
        timestamp: new Date(data.timestamp)
      });
    });

    // Handle booking status updates
    newSocket.on('bookingStatusChanged', (data) => {
      setActiveBooking(prev => ({
        ...prev,
        status: data.status,
        driverLocation: data.driverLocation
      }));
      
      // Show notification to user
      if (data.status === 'accepted') {
        toast.success('Your booking has been accepted!');
      } else if (data.status === 'in_progress') {
        toast.info('Your driver is on the way!');
      } else if (data.status === 'completed') {
        toast.success('Ride completed! Thank you for choosing our service.');
      } else if (data.status === 'cancelled') {
        toast.warning('Your booking has been cancelled.');
      }
    });

    // Handle driver status changes
    newSocket.on('driverStatusChanged', (data) => {
      if (data.isOnline) {
        toast.info('You are now online and available for bookings');
      } else {
        toast.warning('You are now offline and will not receive new bookings');
      }
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      newSocket.disconnect();
    };
  }, [isAuthenticated, user?._id]);

  // Update driver's location
  const updateDriverLocation = (location) => {
    if (socket && isConnected) {
      socket.emit('locationUpdate', {
        driverId: user._id,
        location: {
          lat: location.lat,
          lng: location.lng
        }
      });
    }
  };

  // Update booking status
  const updateBookingStatus = (bookingId, status, driverLocation = null) => {
    if (socket && isConnected) {
      socket.emit('bookingStatusUpdate', {
        bookingId,
        status,
        driverId: user._id,
        ...(driverLocation && { driverLocation })
      });
    }
  };

  // Toggle driver's online status
  const toggleOnlineStatus = (isOnline) => {
    if (socket && isConnected) {
      socket.emit('driverStatus', { isOnline });
    }
  };

  return (
    <WebSocketContext.Provider
      value={{
        socket,
        isConnected,
        driverLocation,
        activeBooking,
        updateDriverLocation,
        updateBookingStatus,
        toggleOnlineStatus
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
/// In socketService.js, update the driver_ride_response handler
socket.on('driver_ride_response', async ({ bookingId, driverId, accepted }) => {
  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    const driver = await User.findById(driverId);
    if (!driver) {
      throw new Error('Driver not found');
    }

    if (accepted) {
      // Check if booking is still available
      if (booking.status !== 'pending') {
        socket.emit('ride_unavailable', {
          bookingId,
          message: 'This ride has already been taken'
        });
        return;
      }

      // Update booking with driver info
      booking.driver = driverId;
      booking.status = 'driver_assigned';
      booking.acceptedAt = new Date();
      await booking.save();

      // Notify user that driver is on the way
      io.to(`user_${booking.user}`).emit('driver_assigned', {
        bookingId: booking._id,
        driver: {
          id: driver._id,
          name: driver.name,
          phone: driver.phone,
          vehicle: driver.vehicleDetails
        },
        estimatedArrival: '5 min', // You'd calculate this
        timestamp: new Date()
      });

      // Notify other drivers that ride is taken
      io.to('drivers').emit('ride_taken', {
        bookingId: booking._id,
        message: 'Ride has been accepted by another driver'
      });

    } else {
      // Driver rejected the ride
      // You might want to implement a cooldown or limit on rejections
      // and find another driver if needed
    }

  } catch (error) {
    console.error('Error handling driver response:', error);
    socket.emit('error', { message: 'Failed to process response' });
  }
});

export default WebSocketContext;
