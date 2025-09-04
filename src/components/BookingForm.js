import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const BookingForm = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    message: '',
    pickupLocation: '',
    dropLocation: '',
    date: '',
    time: '',
    passengers: '',
    vehicleType: '',
    paymentMethod: 'cash'
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      navigate('/login', { state: { from: '/book-taxi' } });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validateForm = () => {
    const requiredFields = ['fullName', 'email', 'phone', 'pickupLocation', 'dropLocation', 'date', 'time', 'passengers', 'vehicleType'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return false;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    // Phone number validation (at least 10 digits)
    const phoneRegex = /^\d{10,}$/;
    if (!phoneRegex.test(formData.phone.replace(/[^\d]/g, ''))) {
      setError('Please enter a valid phone number (at least 10 digits)');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/book-taxi' } });
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Format the data before sending
      const bookingData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone.replace(/[^\d]/g, ''),
        message: formData.message,
        pickupLocation: {
          address: formData.pickupLocation,
          coordinates: {
            lat: 0,  // Placeholder - implement geocoding
            lng: 0   // Placeholder - implement geocoding
          }
        },
        dropLocation: {
          address: formData.dropLocation,
          coordinates: {
            lat: 0,  // Placeholder - implement geocoding
            lng: 0   // Placeholder - implement geocoding
          }
        },
        date: new Date(formData.date).toISOString().split('T')[0],
        time: formData.time,
        passengers: parseInt(formData.passengers, 10),
        vehicleType: formData.vehicleType,
        paymentMethod: formData.paymentMethod
      };
      
      console.log('Submitting booking:', JSON.stringify(bookingData, null, 2));
      const response = await bookingService.createBooking(bookingData);
      console.log('Booking created:', response.data);
      
      setSuccess(true);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        message: '',
        pickupLocation: '',
        dropLocation: '',
        date: '',
        time: '',
        passengers: '',
        vehicleType: '',
        paymentMethod: 'cash'
      });
    } catch (err) {
      console.error('Error creating booking:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        config: {
          url: err.config?.url,
          method: err.config?.method,
          data: err.config?.data
        }
      });
      setError(err.response?.data?.message || 'Something went wrong. Please check your input and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return <div>Redirecting to login...</div>;
  }

  return (
    <div
      className="relative bg-cover bg-center bg-fixed min-h-screen -mt-8"
      style={{
        backgroundImage:
          "url('https://th.bing.com/th/id/OIP.nhsLfkTKM7jjEyqRfUjsdAHaEK?w=285&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3')",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-60"></div>

      {/* Main Content */}
      <div className="relative z-10 py-8">
        {/* Book Your Trip */}
        <div className="w-full bg-gray-900 py-12 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Book Your Taxi</h2>
          <p className="text-white text-sm max-w-2xl mx-auto">
            Reserve your taxi and travel service seamlessly with our detailed booking system
          </p>
        </div>

        {/* Contact Us */}
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-white mt-6 mb-2">Contact Us</h2>
          <p className="text-white text-sm max-w-2xl mx-auto">
            Get in touch or drop us a message and we'll get back to you
          </p>
        </div>

        {/* Form */}
        <div className="max-w-md mx-auto bg-white rounded-xl p-6 shadow-xl">
          {success ? (
            <div className="text-center py-8">
              <div className="text-green-500 text-5xl mb-4">✓</div>
              <h3 className="text-2xl font-bold mb-2">Thank You!</h3>
              <p className="text-gray-600">Your booking has been sent successfully. We'll get back to you soon.</p>
              <button
                type="submit"
                className={`w-full ${loading ? 'bg-orange-400' : 'bg-orange-500 hover:bg-orange-600'} text-white font-semibold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline mt-6 transition duration-300 flex items-center justify-center`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Confirm Booking'
                )}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
              
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full mb-4 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-orange-500"
                required
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email address"
                className="w-full mb-4 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-orange-500"
                required
              />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your mobile number"
                className="w-full mb-4 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-orange-500"
                required
              />
              
              {/* नए आवश्यक फ़ील्ड्स जोड़े गए */}
              <input
                type="text"
                name="pickupLocation"
                value={formData.pickupLocation}
                onChange={handleChange}
                placeholder="Pickup Location"
                className="w-full mb-4 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-orange-500"
                required
              />
              <input
                type="text"
                name="dropLocation"
                value={formData.dropLocation}
                onChange={handleChange}
                placeholder="Drop Location"
                className="w-full mb-4 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-orange-500"
                required
              />
              <div className="flex space-x-2 mb-4">
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-1/2 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-orange-500"
                  required
                />
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="w-1/2 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-orange-500"
                  required
                />
              </div>
              <input
                type="number"
                name="passengers"
                value={formData.passengers}
                onChange={handleChange}
                placeholder="Number of Passengers"
                min="1"
                className="w-full mb-4 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-orange-500"
                required
              />
              <select
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
                className="w-full mb-4 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-orange-500"
                required
              >
                <option value="">Select Vehicle Type</option>
                <option value="hatchback">Hatchback (Up to 4 passengers)</option>
                <option value="sedan">Sedan (Up to 4 passengers)</option>
                <option value="suv">SUV (Up to 6 passengers)</option>
                <option value="muv">MUV (Up to 7 passengers)</option>
                <option value="luxury">Luxury Car (Up to 4 passengers)</option>
                <option value="van">Van (Up to 10 passengers)</option>
              </select>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="w-full mb-4 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-orange-500"
                required
              >
                <option value="cash">Cash Payment</option>
                <option value="card">Card Payment</option>
                <option value="upi">UPI Payment</option>
                <option value="wallet">Wallet Payment</option>
              </select>
              
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Additional instructions or requirements"
                rows="4"
                className="w-full mb-4 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-orange-500"
              ></textarea>
              <button
                type="submit"
                disabled={loading}
                className={`w-full ${loading ? 'bg-gray-400' : 'bg-orange-500 hover:bg-orange-600'} text-white font-semibold py-2 rounded-full transition duration-300 flex justify-center items-center`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Book Now'
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Testimonial Section */}
      <div className=" w-auto py-12 mt-10 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between ">
            {/* 📸 Image Section */}
            <div className="w-full md:w-1/2">
              <img
                src="https://th.bing.com/th/id/OIP.2uKdGNTS6IjQFrNfSYHSRAHaEK?w=296&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3"
                alt="Taxi Travel"
                className="w-full h-auto shadow-lg"
              />
            </div>

            {/* 🌟 Review Section */}
            <div className="w-full bg-orange-600 h-[330px] md:w-1/2 text-white text-center md:text-left  flex flex-col justify-center items-center px-6">
              <div className="mb-2 text-xl">★★★★★</div>
              <p className="text-lg font-medium mb-4 text-center md:text-left">
                "Excellent service and highly professional booking experience. Highly recommend HRTaxi.com for your travel needs!"
              </p>
              <div className="flex items-center justify-center md:justify-start">
                <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden mr-3">
                  <img
                    src="/avatar.jpg"
                    alt="Customer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold">Rahul Sharma</p>
                  <p className="text-sm">Delhi, India</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
