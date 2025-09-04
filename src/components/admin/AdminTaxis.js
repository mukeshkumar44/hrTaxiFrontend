import React, { useState, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom'; 
import { adminService } from '../../services/api'; 

const AdminTaxis = () => { 
  const [taxis, setTaxis] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(''); 
  const [searchTerm, setSearchTerm] = useState(''); 
  const [statusFilter, setStatusFilter] = useState('all'); 
  const [selectedTaxi, setSelectedTaxi] = useState(null); 
  const [showDetailsModal, setShowDetailsModal] = useState(false); 
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const navigate = useNavigate(); 

  useEffect(() => { 
    const checkAdminAccess = () => { 
      const user = JSON.parse(localStorage.getItem('user') || '{}'); 
      if (!user || user.role !== 'admin') { 
        navigate('/'); 
      } 
    }; 

    const fetchTaxis = async () => { 
      try { 
        setLoading(true);
        setError(''); 
        console.log('Fetching taxis...');
        
        const response = await adminService.getAllTaxis();
        
        // Log the full response for debugging
        console.log('Taxis API Response:', response);
        
        // The backend returns { success: true, data: [...], count: number }
        if (response.data && response.data.success !== false) {
          const taxisData = response.data.data || [];
          if (Array.isArray(taxisData)) {
            setTaxis(taxisData);
          } else {
            console.warn('Unexpected taxis data format:', taxisData);
            setError('Received invalid data format from server');
            setTaxis([]);
          }
        } else {
          setError(response.data?.message || 'Failed to load taxis');
          setTaxis([]);
        }
      } catch (err) { 
        console.error('Error fetching taxis:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
          url: err.config?.url
        });
        
        let errorMessage = 'Failed to load taxis. Please try again later.';
        if (err.response) {
          if (err.response.status === 401) {
            errorMessage = 'Session expired. Please log in again.';
            // Optionally redirect to login
            // navigate('/login');
          } else if (err.response.data?.message) {
            errorMessage = err.response.data.message;
          }
        }
        
        setError(errorMessage);
        setTaxis([]);
      } finally { 
        setLoading(false); 
      } 
    }; 

    checkAdminAccess(); 
    fetchTaxis(); 
  }, [navigate]); 

  const handleSearch = (e) => { 
    setSearchTerm(e.target.value); 
  }; 

  const handleStatusFilterChange = (e) => { 
    setStatusFilter(e.target.value); 
  }; 

  // Ensure taxis is always treated as an array
  const filteredTaxis = (Array.isArray(taxis) ? taxis : []).filter(taxi => { 
    // Add null checks for taxi properties
    if (!taxi) return false;
    
    const driverName = taxi.driverName || '';
    const vehicleModel = taxi.vehicleModel || '';
    const vehicleNumber = taxi.vehicleNumber || '';
    const phone = taxi.phone || '';
    const taxiStatus = taxi.status || '';
    
    const matchesSearch = 
      driverName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      vehicleModel.toLowerCase().includes(searchTerm.toLowerCase()) || 
      vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
      phone.includes(searchTerm); 
    
    const matchesStatus = statusFilter === 'all' || taxiStatus === statusFilter; 
    
    return matchesSearch && matchesStatus; 
  }); 

  const handleViewDetails = (taxi) => { 
    setSelectedTaxi(taxi); 
    setShowDetailsModal(true); 
  }; 

  const handleDeleteClick = (taxi) => { 
    setSelectedTaxi(taxi); 
    setShowDeleteModal(true); 
  }; 

  const handleApprove = async () => {
    try {
      await adminService.updateTaxiStatus(selectedTaxi._id, 'approved');
      
      // Update local state
      setTaxis(taxis.map(taxi =>
        taxi._id === selectedTaxi._id 
          ? { ...taxi, status: 'approved', isApproved: true } 
          : taxi
      ));
      
      // Close the modal
      setShowDetailsModal(false);
      setSelectedTaxi(null);
      
    } catch (err) {
      setError('Failed to approve taxi');
      console.error(err);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }
    
    try {
      await adminService.updateTaxiStatus(selectedTaxi._id, 'rejected', rejectionReason);
      
      // Update local state
      setTaxis(taxis.map(taxi =>
        taxi._id === selectedTaxi._id 
          ? { ...taxi, status: 'rejected', isApproved: false, rejectionReason } 
          : taxi
      ));
      
      // Close the modal and reset form
      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedTaxi(null);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject taxi');
    }
  };

  const handleDeleteConfirm = async () => { 
    try { 
      await adminService.deleteTaxi(selectedTaxi._id); 
      setTaxis(taxis.filter(taxi => taxi._id !== selectedTaxi._id)); 
      setShowDeleteModal(false); 
      setSelectedTaxi(null); 
    } catch (err) { 
      setError('Failed to delete taxi'); 
      console.error(err); 
    } 
  }; 

  if (loading) { 
    return ( 
      <div className="min-h-screen bg-gray-100 pt-24 pb-12 flex justify-center items-center"> 
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div> 
      </div> 
    ); 
  } 

  return ( 
    <div className="min-h-screen bg-gray-100 pt-24 pb-12"> 
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> 
        <div className="flex justify-between items-center mb-6"> 
          <h1 className="text-3xl font-bold text-gray-900">Taxi Management</h1> 
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <button 
            onClick={() => navigate('/admin/dashboard')} 
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md transition duration-300" 
          > 
            Back to Dashboard 
          </button> 
        </div> 

        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6"> 
          <div className="p-4 border-b flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0"> 
            <input 
              type="text" 
              placeholder="Search taxis..." 
              className="w-full md:w-1/2 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500" 
              value={searchTerm} 
              onChange={handleSearch} 
            /> 
            
            <div className="flex items-center space-x-2"> 
              <label htmlFor="statusFilter" className="text-gray-700">Status:</label> 
              <select 
                id="statusFilter" 
                value={statusFilter} 
                onChange={handleStatusFilterChange} 
                className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500" 
              > 
                <option value="all">All</option> 
                <option value="pending">Pending</option> 
                <option value="approved">Approved</option> 
                <option value="rejected">Rejected</option> 
              </select> 
            </div> 
          </div> 

          <div className="overflow-x-auto"> 
            <table className="min-w-full divide-y divide-gray-200"> 
              <thead className="bg-gray-50"> 
                <tr> 
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th> 
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th> 
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License</th> 
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th> 
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th> 
                </tr> 
              </thead> 
              <tbody className="bg-white divide-y divide-gray-200"> 
                {filteredTaxis.length > 0 ? ( 
                  filteredTaxis.map((taxi) => ( 
                    <tr key={taxi._id}> 
                      <td className="px-6 py-4 whitespace-nowrap"> 
                        <div className="text-sm font-medium text-gray-900">{taxi.driverName}</div> 
                        <div className="text-sm text-gray-500">{taxi.phone}</div> 
                      </td> 
                      <td className="px-6 py-4 whitespace-nowrap"> 
                        <div className="text-sm text-gray-900">{taxi.vehicleModel}</div> 
                        <div className="text-sm text-gray-500">{taxi.vehicleNumber}</div> 
                      </td> 
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{taxi.licenseNumber}</td> 
                      <td className="px-6 py-4 whitespace-nowrap"> 
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${taxi.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : taxi.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}> 
                          {taxi.status} 
                        </span> 
                      </td> 
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium"> 
                        <button 
                          onClick={() => handleViewDetails(taxi)} 
                          className="text-indigo-600 hover:text-indigo-900 mr-4" 
                        > 
                          View Details 
                        </button> 
                        <button 
                          onClick={() => handleDeleteClick(taxi)} 
                          className="text-red-600 hover:text-red-900" 
                        > 
                          Delete 
                        </button> 
                      </td> 
                    </tr> 
                  )) 
                ) : ( 
                  <tr> 
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500"> 
                      No taxis found 
                    </td> 
                  </tr> 
                )} 
              </tbody> 
            </table> 
          </div> 
        </div> 
      </div> 

      {/* Taxi Details Modal */} 
      {showDetailsModal && selectedTaxi && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-4">Taxi Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="font-semibold">Driver Name:</p>
                <p>{selectedTaxi.driverName || 'N/A'}</p>
              </div>
              <div>
                <p className="font-semibold">Vehicle Number:</p>
                <p>{selectedTaxi.vehicleNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="font-semibold">Vehicle Model:</p>
                <p>{selectedTaxi.vehicleModel || 'N/A'}</p>
              </div>
              <div>
                <p className="font-semibold">Vehicle Type:</p>
                <p>{selectedTaxi.vehicleType || 'N/A'}</p>
              </div>
              <div>
                <p className="font-semibold">License Number:</p>
                <p>{selectedTaxi.licenseNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="font-semibold">Phone Number:</p>
                <p>{selectedTaxi.phoneNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="font-semibold">Status:</p>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  selectedTaxi.status === 'approved' 
                    ? 'bg-green-100 text-green-800' 
                    : selectedTaxi.status === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {selectedTaxi.status || 'pending'}
                </span>
              </div>
              {selectedTaxi.rejectionReason && (
                <div className="col-span-full">
                  <p className="font-semibold">Rejection Reason:</p>
                  <p className="text-red-600">{selectedTaxi.rejectionReason}</p>
                </div>
              )}
              {selectedTaxi.documents && (
                <div className="col-span-full">
                  <p className="font-semibold">Documents:</p>
                  <a 
                    href={`${process.env.REACT_APP_API_URL.replace('/api', '')}${selectedTaxi.documents}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View Document
                  </a>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              {selectedTaxi.status !== 'approved' && (
                <button
                  onClick={() => setShowRejectModal(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Reject
                </button>
              )}
              {selectedTaxi.status !== 'rejected' && (
                <button
                  onClick={handleApprove}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Approve
                </button>
              )}
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedTaxi(null);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedTaxi && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Reject Taxi Application</h3>
            <p className="mb-4">Please provide a reason for rejecting this taxi application:</p>
            
            <textarea
              className="w-full p-2 border rounded mb-4"
              rows="4"
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
            
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                }}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                disabled={!rejectionReason.trim()}
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */} 
      {showDeleteModal && ( 
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50"> 
          <div className="bg-white rounded-lg p-6 max-w-md mx-auto"> 
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3> 
            <p className="text-gray-500 mb-6"> 
              Are you sure you want to delete taxi registration for <span className="font-semibold">{selectedTaxi?.driverName}</span>? This action cannot be undone. 
            </p> 
            <div className="flex justify-end space-x-4"> 
              <button 
                onClick={() => setShowDeleteModal(false)} 
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md transition duration-300" 
              > 
                Cancel 
              </button> 
              <button 
                onClick={handleDeleteConfirm} 
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition duration-300" 
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

export default AdminTaxis;