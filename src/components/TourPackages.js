import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import TourBookingForm from './TourBookingForm';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import apiClient, { API_ENDPOINTS } from '../config/api';

const TourPackages = () => {
  const { currentUser } = useAuth();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [imageLoadErrors, setImageLoadErrors] = useState({});
  const [visibleCount, setVisibleCount] = useState(6);

  const fetchTourPackages = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching tour packages from:', API_ENDPOINTS.TOUR_PACKAGES);
      const response = await apiClient.get(API_ENDPOINTS.TOUR_PACKAGES);
      
      console.log('API Response:', response);
      
      // Handle both array and object responses
      const tourPackages = Array.isArray(response.data) 
        ? response.data 
        : (response.data?.data || []);
      
      setPackages(tourPackages);
    } catch (err) {
      console.error('Error fetching tour packages:', err);
      console.error('Error details:', {
        message: err.message,
        url: err.config?.url,
        status: err.response?.status,
        response: err.response?.data
      });
      setError('Failed to load tour packages. Please try again later.');
      toast.error('Failed to load tour packages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTourPackages();
  }, []);

  const handleImageError = (id) => {
    setImageLoadErrors(prev => ({ ...prev, [id]: true }));
  };

  const loadMore = () => {
    setVisibleCount(prev => prev + 6); // Load 6 more packages
  };

  const visiblePackages = packages.slice(0, visibleCount);
  const hasMore = visibleCount < packages.length;

  if (loading && packages.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 -mt-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12">Tour Packages</h1>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p>{error}</p>
            <button 
              onClick={fetchTourPackages}
              className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Retry
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {visiblePackages.map((pkg) => (
            <div 
              key={pkg._id} 
              className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="h-64 relative overflow-hidden">
                {!imageLoadErrors[pkg._id] ? (
                  <>
                    <img
                      src={pkg.image?.url || pkg.image || '/default-tour.jpg'}
                      alt={pkg.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={() => handleImageError(pkg._id)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  </>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">
                      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </span>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex justify-between items-end">
                    <h2 className="text-2xl font-bold text-white drop-shadow-lg">{pkg.title}</h2>
                    <span className="bg-yellow-500 text-white text-sm font-semibold px-3 py-1 rounded-full">
                      ₹{pkg.price?.toLocaleString() || 'N/A'}
                    </span>
                  </div>
                </div>
                {pkg.discount && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {pkg.discount}% OFF
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <div className="flex items-center text-gray-500 text-sm mb-3">
                  <svg className="w-4 h-4 mr-1 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                  <span>{pkg.duration || '1 Day'}</span>
                  <span className="mx-2">•</span>
                  <svg className="w-4 h-4 mr-1 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{pkg.location || 'Various Locations'}</span>
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-3">{pkg.description}</p>
                
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                  <div className="flex items-center">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map((item) => (
                        <div key={item} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200"></div>
                      ))}
                      <div className="w-8 h-8 rounded-full border-2 border-white bg-yellow-500 flex items-center justify-center text-white text-xs font-bold">
                        +5
                      </div>
                    </div>
                    <span className="ml-2 text-sm text-gray-500">Booked</span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedPackage(pkg);
                      setShowBookingForm(true);
                    }}
                    className="px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-medium rounded-full hover:shadow-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50"
                  >
                    Book Now
                    <svg className="w-4 h-4 ml-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {hasMore && (
          <div className="mt-10 text-center">
            <button
              onClick={loadMore}
              disabled={loading}
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}

        {showBookingForm && selectedPackage && (
          <TourBookingForm
            tourPackage={selectedPackage}
            onClose={() => setShowBookingForm(false)}
            userId={currentUser?._id}
          />
        )}
      </div>
    </div>
  );
};

export default TourPackages;