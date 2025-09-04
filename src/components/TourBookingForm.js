import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import tourService from '../services/tourService';

const TourBookingForm = ({ tourPackage, onClose, currentUser }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    travelDate: '',
    numberOfPeople: 1,
    specialRequests: '',
    pickupLocation: ''
  });
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();

  // Pre-fill user data when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || ''
      }));
    }
  }, [currentUser]);

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name?.trim()) errors.name = 'Name is required';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    const cleanPhone = String(formData.phone || '').replace(/\D/g, '');
    if (!formData.phone) {
      errors.phone = 'Phone number is required';
    } else if (cleanPhone.length < 10) {
      errors.phone = 'Please enter a valid phone number (at least 10 digits)';
    }
    
    if (!formData.travelDate) {
      errors.travelDate = 'Travel date is required';
    } else if (new Date(formData.travelDate) < new Date()) {
      errors.travelDate = 'Travel date cannot be in the past';
    }
    
    if (!formData.numberOfPeople || formData.numberOfPeople < 1) {
      errors.numberOfPeople = 'Number of people must be at least 1';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'numberOfPeople' ? parseInt(value, 10) || 1 : value
    }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (!currentUser?._id) {
      toast.error('Please login to book a tour');
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }
    
    setLoading(true);
    
    try {
      // Prepare booking data
      const bookingData = {
        tourId: tourPackage._id,
        tourTitle: tourPackage.title,
        tourPrice: tourPackage.price,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: String(formData.phone).replace(/\D/g, ''),
        travelDate: new Date(formData.travelDate).toISOString(),
        numberOfPeople: Number(formData.numberOfPeople),
        specialRequests: formData.specialRequests?.trim() || '',
        pickupLocation: formData.pickupLocation?.trim() || ''
      };

      console.log('Submitting booking data:', bookingData);
      
      // Use tourService to book the tour
      const result = await tourService.bookTour(bookingData);
      
      console.log('Booking successful:', result);
      
      toast.success('Tour booked successfully!', {
        autoClose: 2000,
        onClose: () => {
          if (onClose) onClose();
          // Redirect to dashboard after successful booking
          navigate('/dashboard/my-bookings');
        }
      });
      
    } catch (error) {
      console.error('Booking error:', error);
      
      let errorMessage = 'Failed to book tour. Please try again.';
      
      if (error.status === 400) {
        errorMessage = error.message || 'Invalid booking data. Please check your information.';
      } else if (error.status === 401) {
        errorMessage = 'Your session has expired. Please log in again.';
        navigate('/login', { state: { from: window.location.pathname } });
      } else if (error.status === 409) {
        errorMessage = 'You already have a booking for this tour.';
      } else if (error.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (!error.response) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection.';
      }
      
      toast.error(errorMessage, { 
        autoClose: 5000,
        position: 'top-center'
      });
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-6 relative">
          <h2 className="text-2xl font-bold text-white">Book Your Tour</h2>
          <p className="text-yellow-100">{tourPackage?.title}</p>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-yellow-200"
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full rounded-md border ${formErrors.name ? 'border-red-500' : 'border-gray-300'} p-2 focus:ring-2 focus:ring-yellow-500`}
                  placeholder="John Doe"
                />
                {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full rounded-md border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} p-2 focus:ring-2 focus:ring-yellow-500`}
                  placeholder="you@example.com"
                />
                {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full rounded-md border ${formErrors.phone ? 'border-red-500' : 'border-gray-300'} p-2 focus:ring-2 focus:ring-yellow-500`}
                  placeholder="+91 1234567890"
                />
                {formErrors.phone && <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Travel Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="travelDate"
                  value={formData.travelDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full rounded-md border ${formErrors.travelDate ? 'border-red-500' : 'border-gray-300'} p-2 focus:ring-2 focus:ring-yellow-500`}
                />
                {formErrors.travelDate && <p className="text-red-500 text-sm mt-1">{formErrors.travelDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of People <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="numberOfPeople"
                  min="1"
                  value={formData.numberOfPeople}
                  onChange={handleChange}
                  className={`w-full rounded-md border ${formErrors.numberOfPeople ? 'border-red-500' : 'border-gray-300'} p-2 focus:ring-2 focus:ring-yellow-500`}
                />
                {formErrors.numberOfPeople && <p className="text-red-500 text-sm mt-1">{formErrors.numberOfPeople}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pickup Location
                </label>
                <input
                  type="text"
                  name="pickupLocation"
                  value={formData.pickupLocation}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-yellow-500"
                  placeholder="Your pickup address"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Special Requests
            </label>
            <textarea
              name="specialRequests"
              rows="3"
              value={formData.specialRequests}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-yellow-500"
              placeholder="Any special requirements?"
            ></textarea>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-medium py-3 px-6 rounded-lg hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-70"
            >
              {loading ? 'Processing...' : 'Book Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TourBookingForm;
