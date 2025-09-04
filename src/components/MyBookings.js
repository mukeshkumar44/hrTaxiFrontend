import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../services/api';
import tourService from '../services/tourService';
import { FaTaxi, FaBusAlt, FaMapMarkerAlt, FaCalendarAlt, FaUser, FaPhone } from 'react-icons/fa';

const MyBookings = () => {
  const [bookings, setBookings] = useState({ taxi: [], tour: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('taxi');
  const navigate = useNavigate();

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');
  
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
  
      // दोनों requests को parallel में fetch करो
      const [taxiResponse, tourResponse] = await Promise.all([
        apiClient.get('/bookings/my-bookings')
          .then(res => res.data.data) // taxi bookings array
          .catch(err => {
            console.error('Error fetching taxi bookings:', err);
            return [];
          }),
        tourService.getUserTourBookings()
          .then(res => res.data.data) // tour bookings array
          .catch(err => {
            console.error('Error fetching tour bookings:', err);
            return [];
          })
      ]);
  
      console.log('Fetched bookings:', { taxi: taxiResponse, tour: tourResponse });
  
      setBookings({
        taxi: Array.isArray(taxiResponse) ? taxiResponse : [],
        tour: Array.isArray(tourResponse) ? tourResponse : []
      });
  
    } catch (error) {
      console.error('Error in fetchBookings:', error);
      setError('Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchBookings();
  }, [navigate]);

  const getStatusInfo = (status) => {
    const statusMap = {
      // Taxi statuses
      'pending': { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      'accepted': { color: 'bg-blue-100 text-blue-800', text: 'Driver Assigned' },
      'arrived': { color: 'bg-purple-100 text-purple-800', text: 'Driver Arrived' },
      'started': { color: 'bg-indigo-100 text-indigo-800', text: 'In Progress' },
      'completed': { color: 'bg-green-100 text-green-800', text: 'Completed' },
      'cancelled': { color: 'bg-red-100 text-red-800', text: 'Cancelled' },
      // Tour statuses
      'driver_assigned': { color: 'bg-blue-100 text-blue-800', text: 'Driver Assigned' },
      'driver_arrived': { color: 'bg-purple-100 text-purple-800', text: 'Driver Arrived' },
      'in_progress': { color: 'bg-indigo-100 text-indigo-800', text: 'Tour in Progress' },
    };

    return statusMap[status] || { color: 'bg-gray-100 text-gray-800', text: status };
  };

  const renderBookingCard = (booking, type = 'taxi') => {
    const status = getStatusInfo(booking.status);
    const isTaxi = type === 'taxi';
  
    return (
      <div key={booking._id} className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold">
              {isTaxi ? 'Taxi Ride' : 'Tour'} #{booking.bookingId || booking._id.slice(-6).toUpperCase()}
            </h3>
            <span className={`text-xs px-2 py-1 rounded-full ${status.color} mt-1 inline-block`}>
              {status.text}
            </span>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">
              {new Date(booking.createdAt).toLocaleDateString()}
            </div>
            <div className="font-bold text-yellow-600">
              ₹{isTaxi ? booking.fare : booking.tourPackage?.price || 0}
            </div>
          </div>
        </div>
  
        <div className="mt-3 text-sm">
          {/* Locations / Tour name */}
          <div className="flex items-center text-gray-600 mb-1">
            <FaMapMarkerAlt className="mr-2 text-red-500" />
            {isTaxi
              ? `${booking.pickupLocation?.address || 'N/A'} → ${booking.dropLocation?.address || 'N/A'}`
              : booking.tourPackage?.name || 'Tour'}
          </div>
  
          {/* Tour date */}
          {!isTaxi && booking.tourDate && (
            <div className="flex items-center text-gray-600 mb-1">
              <FaCalendarAlt className="mr-2 text-blue-500" />
              {new Date(booking.tourDate).toLocaleDateString()}
            </div>
          )}
  
          {/* Driver info */}
          {booking.driver ? (
            <div className="flex items-center text-gray-600">
              <FaUser className="mr-2 text-green-500" />
              {booking.driver.name}
              <a href={`tel:${booking.driver.phone}`} className="ml-2 text-blue-600">
                <FaPhone className="inline" />
              </a>
            </div>
          ) : (
            <div className="text-gray-500 text-sm mt-1">
              {isTaxi ? 'No driver assigned yet' : 'Driver info not available'}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">My Bookings</h2>
          <button
            onClick={fetchBookings}
            className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b mb-6">
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'taxi' ? 'border-b-2 border-yellow-500' : 'text-gray-500'}`}
            onClick={() => setActiveTab('taxi')}
          >
            <FaTaxi className="inline mr-2" /> Taxi Rides
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'tour' ? 'border-b-2 border-yellow-500' : 'text-gray-500'}`}
            onClick={() => setActiveTab('tour')}
          >
            <FaBusAlt className="inline mr-2" /> Tours
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {bookings[activeTab]?.length > 0 ? (
            bookings[activeTab].map(booking => renderBookingCard(booking, activeTab))
          ) : (
            <div className="text-center py-12 text-gray-500">
              No {activeTab} bookings found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyBookings;