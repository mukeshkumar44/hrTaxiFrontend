import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { bookingService } from '../../services/api';
import { FaTaxi, FaBus, FaCalendarAlt, FaMapMarkerAlt, FaUser, FaPhone } from 'react-icons/fa';
import { API_ENDPOINTS } from '../../config/api';

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('taxi');
  const [taxiBookings, setTaxiBookings] = useState([]);
  const [tourBookings, setTourBookings] = useState([]);
  const [loading, setLoading] = useState({ taxi: true, tour: true });
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading({ taxi: true, tour: true });
        setError('');
        
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Fetch taxi bookings
        const taxiResponse = await bookingService.getBookings();
        setTaxiBookings(taxiResponse.data?.data || []);
        setLoading(prev => ({ ...prev, taxi: false }));

        try {
          // Use the API_ENDPOINTS constant for the tour bookings URL
          const response = await fetch(API_ENDPOINTS.GET_MY_TOUR_BOOKINGS, {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            credentials: 'include'  // Important for cookies if using them
          });

          console.log('Tour bookings response:', {
            status: response.status,
            statusText: response.statusText,
            url: response.url
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          console.log('Tour bookings data:', data);
          
          // Handle different response formats
          if (data.success !== false && (Array.isArray(data) || Array.isArray(data?.data))) {
            setTourBookings(Array.isArray(data) ? data : data.data);
          } else {
            console.warn('Unexpected response format:', data);
            setTourBookings([]);
          }
        } catch (tourError) {
          console.error('Error fetching tour bookings:', tourError);
          setError('Failed to load tour bookings. Please try again later.');
          setTourBookings([]);
        }
        
      } catch (err) {
        console.error('Error in fetchBookings:', err);
        setError('Failed to load bookings. Please try again.');
      } finally {
        setLoading(prev => ({ ...prev, tour: false }));
      }
    };

    if (user) {
      fetchBookings();
    }
  }, [user]);

  const handleNewBooking = (type = 'taxi') => {
    navigate(type === 'taxi' ? '/book-taxi' : '/tours');
  };

  const renderBookingCard = (booking, isTaxi = true) => {
    const location = isTaxi 
      ? booking.pickupLocation?.address || 'Location not specified'
      : booking.tour?.location?.address || booking.location?.address || 'Location not specified';

    return (
      <div key={booking._id} className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">
            {isTaxi ? 'Taxi Booking' : 'Tour Booking'}
          </h3>
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            booking.status === 'completed' ? 'bg-green-100 text-green-800' :
            booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {booking.status}
          </span>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center">
            <FaCalendarAlt className="mr-2 text-gray-500" />
            <span>{
              isTaxi 
                ? new Date(booking.pickupTime).toLocaleString()
                : new Date(booking.travelDate).toLocaleDateString()
            }</span>
          </div>
          
          <div className="flex items-start">
            <FaMapMarkerAlt className="mt-1 mr-2 text-gray-500 flex-shrink-0" />
            <span className="break-words">{location}</span>
          </div>
          
          {isTaxi && booking.driver && (
            <div className="flex items-center">
              <FaUser className="mr-2 text-gray-500" />
              <span>{booking.driver.name || 'Driver not assigned'}</span>
            </div>
          )}
          
          {isTaxi && booking.driver?.phone && (
            <div className="flex items-center">
              <FaPhone className="mr-2 text-gray-500" />
              <a href={`tel:${booking.driver.phone}`} className="text-blue-600 hover:underline">
                {booking.driver.phone}
              </a>
            </div>
          )}
        </div>
      </div>
    );
  };

  const isLoading = loading.taxi && loading.tour;
  const currentBookings = activeTab === 'taxi' ? taxiBookings : tourBookings;
  const currentLoading = activeTab === 'taxi' ? loading.taxi : loading.tour;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Welcome, {user?.name}!</h1>
        <button
          onClick={() => handleNewBooking(activeTab)}
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded"
        >
          {activeTab === 'taxi' ? 'Book a Taxi' : 'Book a Tour'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          className={`px-6 py-3 font-medium ${activeTab === 'taxi' ? 'border-b-2 border-yellow-500' : 'text-gray-500'}`}
          onClick={() => setActiveTab('taxi')}
        >
          <FaTaxi className="inline mr-2" /> Taxi Rides
        </button>
        <button
          className={`px-6 py-3 font-medium ${activeTab === 'tour' ? 'border-b-2 border-yellow-500' : 'text-gray-500'}`}
          onClick={() => setActiveTab('tour')}
        >
          <FaBus className="inline mr-2" /> Tours
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {activeTab === 'taxi' ? 'Your Taxi Rides' : 'Your Tour Bookings'}
        </h2>
        
        {currentLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500"></div>
          </div>
        ) : currentBookings.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {currentBookings.map(booking => renderBookingCard(booking, activeTab))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">
              {activeTab === 'taxi' 
                ? "You don't have any taxi rides yet."
                : "You don't have any tour bookings yet."}
            </p>
            <button
              onClick={() => handleNewBooking(activeTab)}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded"
            >
              {activeTab === 'taxi' ? 'Book Your First Ride' : 'Book a Tour'}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => handleNewBooking('taxi')}
                className="text-blue-600 hover:underline flex items-center"
              >
                <FaTaxi className="mr-2" /> Book a Taxi
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNewBooking('tour')}
                className="text-blue-600 hover:underline flex items-center"
              >
                <FaBus className="mr-2" /> Book a Tour
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate('/profile')}
                className="text-blue-600 hover:underline"
              >
                Update Profile
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
