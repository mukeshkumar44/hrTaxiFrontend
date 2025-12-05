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
        {requests.map((request) => {
          const requestId = request._id || request.bookingId;
          return (
            <div key={requestId} className="border-b border-gray-200 p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="font-medium flex items-center mb-2">
                    <FaUser className="text-gray-600 mr-2" />
                    {request.user?.name || request.customerName || 'Customer'}
                  </div>
                  <div className="text-sm text-gray-600 flex items-start mb-1">
                    <FaMapMarkerAlt className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Pickup:</div>
                      <div>{request.pickupLocation?.address || 'N/A'}</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 flex items-start">
                    <FaMapMarkerAlt className="text-red-500 mr-2 mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Drop-off:</div>
                      <div>{request.dropLocation?.address || request.dropoffLocation?.address || 'N/A'}</div>
                    </div>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className="font-bold text-xl text-green-600">₹{request.fare || '--'}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    <FaClock className="inline mr-1" />
                    {request.createdAt ? new Date(request.createdAt).toLocaleTimeString() : 'Now'}
                  </div>
                </div>
              </div>
              
              {/* Action Buttons - Always Visible */}
              <div className="flex space-x-2 mt-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onReject(request);
                  }}
                  className="flex-1 py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium flex items-center justify-center"
                >
                  <FaTimes className="mr-2" /> Reject
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAccept(request);
                  }}
                  className="flex-1 py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center justify-center"
                >
                  <FaCheck className="mr-2" /> Accept
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RideRequests;
