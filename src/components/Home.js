import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingService } from '../services/api';

const Home = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  
  const handleBookNow = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleNavigateToBooking = () => {
    setShowModal(false);
    navigate('/booking');
  };
  
  const [quickBookingData, setQuickBookingData] = useState({
    pickupLocation: '',
    destination: ''
  });
  const [quickBookingLoading, setQuickBookingLoading] = useState(false);
  const [quickBookingSuccess, setQuickBookingSuccess] = useState(false);
  const [quickBookingError, setQuickBookingError] = useState('');

  const handleQuickBookingChange = (e) => {
    const { id, value } = e.target;
    setQuickBookingData({
      ...quickBookingData,
      [id.replace('quick-', '')]: value
    });
  };

  const handleQuickBookingSubmit = async (e) => {
    e.preventDefault();
    setQuickBookingLoading(true);
    setQuickBookingError('');
    
    try {
      const response = await bookingService.createBooking({
        pickupLocation: quickBookingData.pickupLocation,
        dropLocation: quickBookingData.destination,
        // Add default values for required fields
        fullName: 'Quick Booking',
        email: 'quick@booking.com',
        phone: '9999999999',
        date: new Date().toISOString().split('T')[0],
        time: '12:00',
        passengers: '1',
        vehicleType: 'sedan',
        paymentMethod: 'cash',
        message: 'Quick booking from homepage'
      });
      
      console.log('Quick booking created:', response.data);
      setQuickBookingSuccess(true);
      setQuickBookingData({
        pickupLocation: '',
        destination: ''
      });
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setQuickBookingSuccess(false);
      }, 3000);
      
    } catch (err) {
      console.error('Error creating quick booking:', err);
      setQuickBookingError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setQuickBookingLoading(false);
    }
  };

  useEffect(() => {
    // Add smooth scrolling behavior for mobile
    const html = document.documentElement;
    html.style.scrollBehavior = 'smooth';
    
    return () => {
      html.style.scrollBehavior = '';
    };
  }, []);

  return (
    <div className="relative min-h-screen -mt-4">
      {/* Hero Section */}
      <section className="relative h-screen max-h-[100dvh] min-h-[600px] w-full overflow-hidden pt-20">
        {/* Video Background with Mobile Optimization */}
        <div className="absolute inset-0 w-full h-full">
          <video 
            autoPlay 
            muted 
            loop 
            playsInline 
            className="w-full h-full object-cover"
            poster="https://images.pexels.com/videos/5834567/pexels-photo-5834567.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1700"
            disablePictureInPicture
            preload="auto"
          >
            <source 
              src="https://videos.pexels.com/video-files/5834567/5834567-uhd_2160_3840_24fps.mp4" 
              type="video/mp4" 
              media="(min-width: 1024px)" 
            />
            <source 
              src="https://videos.pexels.com/video-files/5834567/5834567-hd_1920_1080_30fps.mp4" 
              type="video/mp4" 
              media="(min-width: 640px)" 
            />
            <source 
              src="https://videos.pexels.com/video-files/5834567/5834567-sd_540_960_30fps.mp4" 
              type="video/mp4" 
            />
            Your browser does not support the video tag.
          </video>
          <div className="absolute inset-0 bg-black/50 bg-gradient-to-t from-black/70 to-black/30"></div>
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto px-2 sm:px-4">
            <h1 className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl font-bold mb-4 sm:mb-6 leading-tight tracking-tight">
              Your Trusted <span className="text-yellow-400">Travel</span> Partner
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed">
              Experience comfortable and reliable taxi services across India with 24/7 availability
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mx-auto">
              <button 
                onClick={handleBookNow} 
                className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                aria-label="Book a Taxi Now"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Book a Taxi
                </span>
              </button>
              
              <a 
                href="#features" 
                className="w-full sm:w-auto bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-bold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
                aria-label="Learn more about our services"
              >
                Learn More
              </a>
            </div>
            
            {/* Scroll indicator for mobile */}
            <div className="mt-16 sm:mt-20 animate-bounce">
              <div className="w-8 h-12 border-2 border-white/50 rounded-full flex justify-center p-1">
                <div className="w-1 h-2 bg-white rounded-full animate-scroll"></div>
              </div>
              <p className="text-sm mt-2 text-white/80">Scroll to explore</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Quick Booking Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-fadeIn">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-gray-800">Quick Booking Options</h3>
                <button 
                  onClick={handleCloseModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4 mb-6">
                <p className="text-gray-600">How would you like to proceed with your booking?</p>
                
                <button 
                  onClick={handleNavigateToBooking}
                  className="w-full bg-yellow-500 text-black font-bold px-6 py-3 rounded-lg hover:bg-yellow-600 transition duration-300 flex items-center justify-center gap-2"
                >
                  <span>🚕</span>
                  Complete Booking Form
                </button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300 flex items-center justify-center gap-1">
                    <span>📞</span>
                    Call Now
                  </button>
                  <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-300 flex items-center justify-center gap-1">
                    <span>💬</span>
                    WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Booking Form */}
      <div className="bg-white py-8 shadow-lg rounded-lg max-w-4xl mx-auto -mt-20 relative z-20 px-4 lg:px-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Quick Booking</h2>
        {quickBookingSuccess && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded text-center">
            Booking request received! We'll contact you shortly.
          </div>
        )}
        {quickBookingError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-center">
            {quickBookingError}
          </div>
        )}
        <form className="grid grid-cols-1 md:grid-cols-3 gap-4" onSubmit={handleQuickBookingSubmit}>
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="quick-pickup">
              Pickup Location
            </label>
            <input 
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500" 
              id="quick-pickup" 
              type="text" 
              placeholder="Enter pickup location"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="quick-destination">
              Destination
            </label>
            <input 
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500" 
              id="quick-destination" 
              type="text" 
              placeholder="Enter destination"
            />
          </div>

          <div className="flex items-end">
            <button 
              className={`${quickBookingLoading ? 'bg-gray-400' : 'bg-yellow-500 hover:bg-yellow-400'} text-black px-4 py-2 rounded-md font-semibold transition duration-300 w-full flex justify-center items-center`}
              type="submit"
              disabled={quickBookingLoading}
            >
              {quickBookingLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : 'Get Quote'}
            </button>
          </div>
        </form>
      </div>

      {/* Services Section */}
      <div className="bg-gray-100 py-16 mt-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Services</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">We offer a wide range of transportation services to meet all your travel needs</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Airport Transfer */}
            <div className="text-center p-8 bg-white rounded-lg shadow-lg hover:shadow-xl transition duration-300">
              <div className="mb-4">
                <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-4">Airport Transfers</h3>
              <p className="text-gray-600">Reliable airport pickup and drop-off services with flight tracking.</p>
            </div>

            {/* Outstation Trips */}
            <div className="text-center p-8 bg-white rounded-lg shadow-lg hover:shadow-xl transition duration-300">
              <div className="mb-4">
                <div className="w-16 h-16 bg-yellow-500 rounded-full mx-auto flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-4">Outstation Trips</h3>
              <p className="text-gray-600">Comfortable intercity travel with experienced drivers.</p>
            </div>

            {/* Tour Packages */}
            <div className="text-center p-8 bg-white rounded-lg shadow-lg hover:shadow-xl transition duration-300">
              <div className="mb-4">
                <div className="w-16 h-16 bg-green-500 rounded-full mx-auto flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-4">Tour Packages</h3>
              <p className="text-gray-600">Curated tour packages to popular destinations across India.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Why Choose Us Section */}
      <div className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose Us</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">We are committed to providing exceptional service and ensuring your travel experience is comfortable and hassle-free</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Professional Drivers */}
            <div className="text-center p-6">
              <div className="mb-4">
                <div className="w-14 h-14 bg-blue-100 rounded-full mx-auto flex items-center justify-center">
                  <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">Professional Drivers</h3>
              <p className="text-gray-600 text-sm">Experienced, courteous, and well-trained drivers.</p>
            </div>
            
            {/* 24/7 Service */}
            <div className="text-center p-6">
              <div className="mb-4">
                <div className="w-14 h-14 bg-yellow-100 rounded-full mx-auto flex items-center justify-center">
                  <svg className="w-7 h-7 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">24/7 Service</h3>
              <p className="text-gray-600 text-sm">Available round the clock for your convenience.</p>
            </div>
            
            {/* Clean Vehicles */}
            <div className="text-center p-6">
              <div className="mb-4">
                <div className="w-14 h-14 bg-green-100 rounded-full mx-auto flex items-center justify-center">
                  <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">Clean Vehicles</h3>
              <p className="text-gray-600 text-sm">Well-maintained and sanitized vehicles for your safety.</p>
            </div>
            
            {/* Affordable Rates */}
            <div className="text-center p-6">
              <div className="mb-4">
                <div className="w-14 h-14 bg-red-100 rounded-full mx-auto flex items-center justify-center">
                  <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">Affordable Rates</h3>
              <p className="text-gray-600 text-sm">Competitive pricing with no hidden charges.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add this to your global CSS or style tag */}
      <style jsx global>{`
        @keyframes scroll {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(10px); opacity: 0.5; }
        }
        .animate-scroll {
          animation: scroll 1.5s ease-in-out infinite;
        }
        
        /* Improve touch targets for mobile */
        @media (max-width: 640px) {
          button, a[role="button"] {
            min-height: 48px;
            min-width: 48px;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;