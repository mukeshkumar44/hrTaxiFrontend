import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FiCalendar, 
  FiUsers, 
  FiDollarSign, 
  FiPackage as PackageIcon, 
  FiImage, 
  FiAlertCircle, 
  FiTruck, 
  FiPackage,
  FiHome,
  FiUser,
  FiSettings,
  FiLogOut,
  FiChevronDown
} from 'react-icons/fi';
import { adminService } from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBookings: 0,
    totalTaxis: 0,
    totalPackages: 0,
    pendingBookings: 0,
    pendingTaxiApprovals: 0,
    totalRevenue: 0,
    recentBookings: [],
    recentUsers: [],
    completedBookings: 0,
    activeDrivers: 0,
    upcomingTours: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminAccess = () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (!user || user.role !== 'admin') {
          navigate('/');
        }
      } catch (error) {
        console.error('Error checking admin access:', error);
        navigate('/');
      }
    };

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await adminService.getDashboardStats();
        
        if (response.data && response.data.success) {
          setStats({
            totalUsers: response.data.data.totalUsers || 0,
            totalBookings: response.data.data.totalBookings || 0,
            totalTaxis: response.data.data.totalTaxis || 0,
            totalPackages: response.data.data.totalPackages || 0,
            pendingBookings: response.data.data.pendingBookings || 0,
            pendingTaxiApprovals: response.data.data.pendingTaxiApprovals || 0,
            totalRevenue: response.data.data.totalRevenue || 0,
            recentBookings: response.data.data.recentBookings || [],
            recentUsers: response.data.data.recentUsers || [],
            completedBookings: response.data.data.completedBookings || 0,
            activeDrivers: response.data.data.activeDrivers || 0,
            upcomingTours: response.data.data.upcomingTours || 0
          });
        } else {
          console.error('Invalid response format:', response.data);
          setError('Invalid data received from server');
        }
      } catch (err) {
        console.error('Dashboard data error:', err);
        let errorMessage = 'Failed to load dashboard data. Please try again later.';
        
        if (err.response) {
          console.error('Response data:', err.response.data);
          console.error('Response status:', err.response.status);
          
          if (err.response.data && err.response.data.error) {
            errorMessage += `\nError: ${err.response.data.error.message || 'Unknown error'}`;
          }
        } else if (err.request) {
          console.error('No response received:', err.request);
          errorMessage = 'No response from server. Please check your connection.';
        } else {
          console.error('Error:', err.message);
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();
    fetchDashboardData();
    
    // Refresh data every 5 minutes
    const interval = setInterval(fetchDashboardData, 300000);
    return () => clearInterval(interval);
  }, [navigate]);

  const StatCard = ({ icon: Icon, title, value, color, onClick, trend, trendText }) => (
    <div 
      className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer ${onClick ? 'hover:bg-gray-50' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-lg bg-${color}-100 text-${color}-600`}>
          <Icon className="h-6 w-6" />
        </div>
        {trend && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            trend > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% {trendText}
          </span>
        )}
      </div>
      <h3 className="mt-4 text-sm font-medium text-gray-500">{title}</h3>
      <p className="mt-1 text-2xl font-semibold text-gray-900">
        {value}
      </p>
    </div>
  );

  const QuickAction = ({ icon: Icon, title, description, color, onClick }) => (
    <div 
      className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100"
      onClick={onClick}
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${color}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <h3 className="font-medium text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-12 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        <p className="mt-4 text-gray-600">Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-12 flex flex-col items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg max-w-md text-center">
          <div className="flex items-center justify-center mb-2">
            <FiAlertCircle className="h-6 w-6 mr-2" />
            <h3 className="font-medium">Error Loading Dashboard</h3>
          </div>
          <p className="text-sm">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center">
            <div className="relative">
              <button 
                className="flex items-center space-x-2 focus:outline-none"
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              >
                <span className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-medium">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                </span>
                <span className="hidden md:inline-block text-sm font-medium text-gray-700">
                  {user?.name || 'Admin'}
                </span>
                <FiChevronDown className="h-4 w-4 text-gray-500" />
              </button>
              
              {/* Profile Dropdown */}
              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50">
                  <div className="px-4 py-2 border-b">
                    <p className="text-sm font-medium text-gray-900">{user?.name || 'Admin'}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email || 'admin@example.com'}</p>
                  </div>
                  <Link
                    to="/admin/dashboard"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    onClick={() => setShowProfileDropdown(false)}
                  >
                    <FiHome className="mr-2" /> Dashboard
                  </Link>
                  <Link
                    to="/admin/bookings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    onClick={() => setShowProfileDropdown(false)}
                  >
                    <FiCalendar className="mr-2" /> Bookings
                  </Link>
                  <Link
                    to="/admin/taxis"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    onClick={() => setShowProfileDropdown(false)}
                  >
                    <FiTruck className="mr-2" /> Taxis
                  </Link>
                  <Link
                    to="/admin/tour-packages"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    onClick={() => setShowProfileDropdown(false)}
                  >
                    <FiPackage className="mr-2" /> Tour Packages
                  </Link>
                  <Link
                    to="/admin/gallery"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    onClick={() => setShowProfileDropdown(false)}
                  >
                    <FiImage className="mr-2" /> Gallery
                  </Link>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    onClick={() => {
                      localStorage.removeItem('user');
                      navigate('/');
                    }}
                    className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                  >
                    <FiLogOut className="mr-2" /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="mt-1 text-sm text-gray-500">Welcome back! Here's what's happening with your business.</p>
          </div>
          <div className="mt-4 md:mt-0">
            <button className="px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
              Generate Report
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`${activeTab === 'overview' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`${activeTab === 'bookings' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Bookings
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`${activeTab === 'users' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Users
            </button>
            <button
              onClick={() => navigate('/admin/gallery')}
              className={`${activeTab === 'gallery' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Gallery
            </button>
          </nav>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            icon={FiUsers}
            title="Total Users"
            value={stats.totalUsers}
            color="blue"
            onClick={() => navigate('/admin/users')}
            trend={12}
            trendText="vs last month"
          />
          <StatCard 
            icon={FiCalendar}
            title="Total Bookings"
            value={stats.totalBookings}
            color="green"
            onClick={() => navigate('/admin/bookings')}
          />
          <StatCard 
            icon={FiTruck}
            title="Active Taxis"
            value={stats.totalTaxis}
            color="purple"
            onClick={() => navigate('/admin/taxis')}
          />
          <StatCard 
            icon={FiPackage}
            title="Tour Packages"
            value={stats.totalPackages}
            color="yellow"
            onClick={() => navigate('/admin/tour-packages')}
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <QuickAction
              icon={FiUsers}
              title="Add New User"
              description="Create a new user account"
              color="bg-blue-500"
              onClick={() => navigate('/admin/users/new')}
            />
            <QuickAction
              icon={FiTruck}
              title="Add New Taxi"
              description="Register a new taxi"
              color="bg-purple-500"
              onClick={() => navigate('/admin/taxis/new')}
            />
            <QuickAction
              icon={FiPackage}
              title="Create Package"
              description="Add a new tour package"
              color="bg-yellow-500"
              onClick={() => navigate('/admin/tour-packages/new')}
            />
            <QuickAction
              icon={FiCalendar}
              title="View Calendar"
              description="Check booking calendar"
              color="bg-green-500"
              onClick={() => navigate('/admin/calendar')}
            />
            <QuickAction
              icon={FiImage}
              title="Manage Gallery"
              description="Add or remove gallery images"
              color="bg-pink-500"
              onClick={() => navigate('/admin/gallery')}
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Bookings */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Bookings</h3>
              <p className="mt-1 text-sm text-gray-500">Latest booking requests</p>
            </div>
            <div className="bg-white overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {stats.recentBookings.length > 0 ? (
                  stats.recentBookings.map((booking) => (
                    <li key={booking._id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/admin/bookings/${booking._id}`)}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-indigo-600 truncate">
                            {booking.user?.name || 'Unknown User'}
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            {new Date(booking.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            booking.status === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : booking.status === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {booking.status}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-4 sm:px-6 text-center text-gray-500 text-sm">
                    No recent bookings found
                  </li>
                )}
              </ul>
            </div>
            <div className="bg-gray-50 px-4 py-4 sm:px-6 text-right">
              <button 
                onClick={() => navigate('/admin/bookings')}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                View all bookings<span aria-hidden="true"> &rarr;</span>
              </button>
            </div>
          </div>

          {/* Recent Users */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">New Users</h3>
              <p className="mt-1 text-sm text-gray-500">Recently registered users</p>
            </div>
            <div className="bg-white overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {stats.recentUsers.length > 0 ? (
                  stats.recentUsers.map((user) => (
                    <li key={user._id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/admin/users/${user._id}`)}>
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">
                            {user.name || 'Unknown User'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {user.email}
                          </p>
                        </div>
                        <div className="ml-auto">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === 'admin' 
                              ? 'bg-purple-100 text-purple-800' 
                              : user.role === 'driver'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {user.role}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-4 sm:px-6 text-center text-gray-500 text-sm">
                    No recent users found
                  </li>
                )}
              </ul>
            </div>
            <div className="bg-gray-50 px-4 py-4 sm:px-6 text-right">
              <button 
                onClick={() => navigate('/admin/users')}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                View all users<span aria-hidden="true"> &rarr;</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
