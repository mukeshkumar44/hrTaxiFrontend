import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/api';

const AdminBookings = () => {
  // Initialize bookings as an empty array
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminAccess = () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (!user || user.role !== 'admin') {
          navigate('/');
        }
      } catch (err) {
        console.error('Error checking admin access:', err);
        navigate('/login');
      }
    };

    const fetchBookings = async () => {
      try {
        const response = await adminService.getAllBookings();
        console.log('Admin Bookings:', response.data);
        setBookings(response.data);  // Changed from response.data.data to response.data
      } catch (error) {
        console.error('Error fetching admin bookings:', error);
        setError('Failed to load bookings');
      }
    };
    checkAdminAccess();
    fetchBookings();
  }, [navigate]);

  // Ensure filteredBookings is always an array
  const filteredBookings = Array.isArray(bookings) 
    ? bookings.filter(booking => {
        if (!booking) return false;
        
        const searchTermLower = (searchTerm || '').toLowerCase();
        const bookingData = {
          fullName: String(booking.fullName || '').toLowerCase(),
          email: String(booking.email || '').toLowerCase(),
          phone: String(booking.phone || ''),
          pickupLocation: String(booking.pickupLocation || '').toLowerCase(),
          dropLocation: String(booking.dropLocation || '').toLowerCase(),
          status: String(booking.status || '')
        };

        const matchesSearch = 
          bookingData.fullName.includes(searchTermLower) ||
          bookingData.email.includes(searchTermLower) ||
          bookingData.phone.includes(searchTerm) ||
          bookingData.pickupLocation.includes(searchTermLower) ||
          bookingData.dropLocation.includes(searchTermLower);
        
        const matchesStatus = statusFilter === 'all' || bookingData.status === statusFilter;
        
        return matchesSearch && matchesStatus;
      })
    : []; // Fallback to empty array if bookings is not an array

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleStatusClick = (booking) => {
    setSelectedBooking(booking);
    setShowStatusModal(true);
  };

  const handleDeleteClick = (booking) => {
    setSelectedBooking(booking);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedBooking) return;
    
    try {
      await adminService.deleteBooking(selectedBooking._id);
      setBookings(bookings.filter(booking => booking._id !== selectedBooking._id));
      setShowDeleteModal(false);
      setSelectedBooking(null);
    } catch (err) {
      setError('Failed to delete booking');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 pt-24 pb-12 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Manage Bookings</h1>
          <div className="flex space-x-4">
            <input
              type="text"
              placeholder="Search bookings..."
              className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={handleSearch}
            />
            <select
              className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={statusFilter}
              onChange={handleStatusFilterChange}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {filteredBookings.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trip
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <tr key={booking._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.fullName || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">{booking.email || ''}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {booking.pickupLocation || 'N/A'} → {booking.dropLocation || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.date ? new Date(booking.date).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                        booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleStatusClick(booking)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Update Status
                      </button>
                      <button
                        onClick={() => handleDeleteClick(booking)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No bookings found</p>
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  }}
                  className="mt-2 text-indigo-600 hover:text-indigo-800"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && selectedBooking && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h3 className="text-lg font-medium mb-4">Update Booking Status</h3>
            <div className="space-y-4">
              <select
                className="w-full p-2 border rounded"
                value={selectedBooking.status || 'pending'}
                onChange={(e) => {
                  setSelectedBooking({
                    ...selectedBooking,
                    status: e.target.value
                  });
                }}
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    try {
                      await adminService.updateBooking(selectedBooking._id, {
                        status: selectedBooking.status
                      });
                      setBookings(bookings.map(b => 
                        b._id === selectedBooking._id 
                          ? { ...b, status: selectedBooking.status } 
                          : b
                      ));
                      setShowStatusModal(false);
                    } catch (err) {
                      console.error('Error updating booking:', err);
                      setError('Failed to update booking status');
                      setShowStatusModal(false);
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedBooking && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h3 className="text-lg font-medium mb-4">Confirm Deletion</h3>
            <p className="mb-6">Are you sure you want to delete this booking? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await adminService.deleteBooking(selectedBooking._id);
                    setBookings(bookings.filter(b => b._id !== selectedBooking._id));
                    setShowDeleteModal(false);
                  } catch (err) {
                    console.error('Error deleting booking:', err);
                    setError('Failed to delete booking');
                    setShowDeleteModal(false);
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;