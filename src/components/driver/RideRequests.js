import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaClock, FaUser, FaPhone, FaTimes, FaCheck } from 'react-icons/fa';
import { toast } from 'react-toastify';

const RideRequests = ({ requests, onAccept, onReject }) => {
  const [expandedRequest, setExpandedRequest] = useState(null);

  const toggleExpand = (requestId) => {
    setExpandedRequest(expandedRequest === requestId ? null : requestId);
  };

  if (requests.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white rounded-lg shadow-xl z-50 overflow-hidden">
      <div className="bg-yellow-500 text-white p-3 flex justify-between items-center">
        <h3 className="font-bold text-lg">New Ride Requests</h3>
        <span className="bg-white text-yellow-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
          {requests.length}
        </span>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {requests.map((request) => (
          <div key={request.bookingId} className="border-b border-gray-200 p-4">
            <div 
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleExpand(request.bookingId)}
            >
              <div>
                <div className="font-medium flex items-center">
                  <FaUser className="text-gray-600 mr-2" />
                  {request.customerName || 'Customer'}
                </div>
                <div className="text-sm text-gray-500 flex items-center mt-1">
                  <FaMapMarkerAlt className="mr-1" />
                  {request.pickupLocation?.address?.substring(0, 30)}...
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">₹{request.fare || '--'}</div>
                <div className="text-xs text-gray-500">{new Date(request.createdAt).toLocaleTimeString()}</div>
              </div>
            </div>
            
            {expandedRequest === request.bookingId && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div className="flex items-center">
                    <FaMapMarkerAlt className="text-red-500 mr-2" />
                    <div>
                      <div className="font-medium">Pickup</div>
                      <div className="text-gray-600">{request.pickupLocation?.address}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FaMapMarkerAlt className="text-green-500 mr-2" />
                    <div>
                      <div className="font-medium">Drop-off</div>
                      <div className="text-gray-600">{request.dropoffLocation?.address}</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <FaClock className="mr-1" />
                    {new Date(request.createdAt).toLocaleString()}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onReject(request);
                      }}
                      className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                      title="Reject"
                    >
                      <FaTimes />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAccept(request);
                      }}
                      className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors"
                      title="Accept"
                    >
                      <FaCheck />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RideRequests;
