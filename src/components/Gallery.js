import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import apiClient from '../config/api';

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleCount, setVisibleCount] = useState(8);
  const [selectedImage, setSelectedImage] = useState(null);

  const fetchImages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching gallery images from:', '/gallery');
      const response = await apiClient.get('/gallery', {
        params: { 
          _t: new Date().getTime()
        }
      });
      
      console.log('Gallery API Response:', response);
      
      // Handle both array and object responses
      const galleryImages = Array.isArray(response.data) 
        ? response.data 
        : (response.data?.data || []);
      
      setImages(galleryImages);
      
    } catch (err) {
      console.error('Error fetching gallery images:', err);
      console.error('Error details:', {
        message: err.message,
        url: err.config?.url,
        status: err.response?.status,
        response: err.response?.data
      });
      setError('Failed to load images. Please try again later.');
      toast.error('Failed to load gallery images');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const loadMore = () => {
    setVisibleCount(prev => Math.min(prev + 8, images.length));
  };

  const openLightbox = (image) => {
    setSelectedImage(image);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    document.body.style.overflow = 'auto';
  };

  if (loading && images.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center">
          <div className="animate-pulse mb-4">
            <svg className="w-16 h-16 mx-auto text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-600">Loading gallery...</p>
        </div>
      </div>
    );
  }

  const visibleImages = images.slice(0, visibleCount);
  const hasMore = visibleCount < images.length;

  // Create a fallback image component
  const FallbackImage = ({ className = '' }) => (
    <div className={`${className} bg-gray-100 flex items-center justify-center`}>
      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 -mt-12 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-5xl md:text-4xl mb-4">
            <span className="block">Our Gallery</span>
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-gray-500">
            Explore the beautiful moments captured during our amazing tours
          </p>
        </div>
        
        {error && (
          <div className="max-w-2xl mx-auto bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
                <div className="mt-2">
                  <button
                    onClick={fetchImages}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <svg className="-ml-1 mr-1.5 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {visibleImages.map((image, index) => (
            <div 
              key={image._id || index} 
              className="group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer"
              onClick={() => openLightbox(image)}
            >
              {/* Image Container */}
              <div className="aspect-w-4 aspect-h-3 bg-gradient-to-br from-gray-100 to-gray-200 relative">
                {image.image ? (
                  <>
                    <img
                      src={image.image}
                      alt={image.title || `Gallery Image ${index + 1}`}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.parentNode.innerHTML = `
                          <div class="w-full h-full flex items-center justify-center bg-gray-100">
                            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>`;
                      }}
                    />
                    {/* Shine effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  </>
                ) : (
                  <FallbackImage className="w-full h-full" />
                )}
                
                {/* Category/Tag Badge */}
                {image.category && (
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-xs font-semibold px-3 py-1 rounded-full shadow-md text-gray-800 group-hover:bg-yellow-400 group-hover:text-gray-900 transition-colors duration-300">
                    {image.category}
                  </div>
                )}
                
                {/* Favorite Button */}
                <button 
                  className="absolute top-3 left-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md text-gray-600 hover:text-red-500 transition-colors duration-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Add to favorites logic here
                  }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>
              
              {/* Content Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-5">
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  {image.title && (
                    <h3 className="text-white font-bold text-xl mb-2 drop-shadow-md">
                      {image.title}
                    </h3>
                  )}
                  {image.location && (
                    <div className="flex items-center text-gray-200 text-sm mb-2">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {image.location}
                    </div>
                  )}
                  {image.description && (
                    <p className="text-gray-200 text-sm line-clamp-2 mb-3">
                      {image.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-2">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-xs text-gray-200">By {image.photographer || 'Admin'}</span>
                    </div>
                    <span className="text-xs text-gray-300">
                      {image.date || new Date().toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Quick View Button */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {hasMore && (
          <div className="mt-12 text-center">
            <button
              onClick={loadMore}
              disabled={loading}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-all duration-300 transform hover:scale-105"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </>
              ) : (
                <>
                  Load More
                  <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 01-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={closeLightbox}>
          <button 
            className="absolute top-4 right-4 text-white hover:text-yellow-400 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              closeLightbox();
            }}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="relative max-w-4xl w-full max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="bg-white rounded-lg overflow-hidden shadow-2xl">
              <div className="relative pt-[56.25%] bg-black">
                <img
                  src={selectedImage.image}
                  alt={selectedImage.title || 'Gallery Image'}
                  className="absolute inset-0 w-full h-full object-contain"
                />
              </div>
              {(selectedImage.title || selectedImage.description) && (
                <div className="p-6">
                  {selectedImage.title && (
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {selectedImage.title}
                    </h3>
                  )}
                  {selectedImage.description && (
                    <p className="text-gray-600">
                      {selectedImage.description}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;