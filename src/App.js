import './App.css';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Import components
import Home from './components/Home';
import TourPackages from './components/TourPackages';
import CustomerReviews from './components/CustomerReviews';
import Gallery from './components/Gallery';
import BookingForm from './components/BookingForm';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import Services from './components/Services';
import Destinations from './components/Destinations';
import Login from './components/Login';
import Signup from './components/Signup';
import OtpVerification from './components/OtpVerification';
import Profile from './components/Profile';
import MyBookings from './components/MyBookings';
import TaxiRegistration from './components/taxi/TaxiRegistration';
import RegistrationStatus from './components/driver/RegistrationStatus';
import DriverDashboard from './components/driver/DriverDashboard';
import UserDashboard from './components/user/UserDashboard';
import TestOtp from './components/TestOtp'; // Added import for TestOtp

// Admin Components
import AdminDashboard from './components/admin/AdminDashboard';
import AdminBookings from './components/admin/AdminBookings';
import AdminTaxis from './components/admin/AdminTaxis';
import AdminTourPackages from './components/AdminTourPackages';
import AdminGallery from './components/admin/AdminGallery';
import AuthRedirect from './components/AuthRedirect';
import ErrorBoundary from './components/common/ErrorBoundary';
import Unauthorized from './components/common/Unauthorized';

// Protected Route Wrapper
const ProtectedRoute = ({ roles = [], children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: window.location.pathname }} replace />;
  }

  // Handle both legacy role and new roles array
  const userRoles = Array.isArray(currentUser.roles) 
    ? currentUser.roles 
    : (currentUser.role ? [currentUser.role] : ['user']);

  // Check if user has any of the required roles
  if (roles.length > 0 && !roles.some(role => userRoles.includes(role))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children ? children : <Outlet />;
};

// Role-based route wrappers
const UserRoute = ({ children }) => (
  <ProtectedRoute roles={['user']}>
    {children}
  </ProtectedRoute>
);

const DriverRoute = ({ children }) => (
  <ProtectedRoute roles={['driver']}>
    {children}
  </ProtectedRoute>
);

const AdminRoute = ({ children }) => (
  <ProtectedRoute roles={['admin']}>
    {children}
  </ProtectedRoute>
);

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <div className="App">
          <Navbar />
          <div className="pt-20">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={
                <>
                  <Home />
                  <TourPackages />
                  <CustomerReviews />
                  <Gallery />
                </>
              } />
              <Route path="/services" element={<Services />} />
              <Route path="/booking" element={<BookingForm />} />
              <Route path="/destinations" element={<Destinations />} />
              <Route path="/auth-redirect" element={<AuthRedirect />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/verify-otp" element={<OtpVerification />} />
              <Route path="/test-otp" element={<TestOtp />} /> {/* Added test route */}
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* Protected User Routes */}
              <Route element={<UserRoute />}>
                <Route path="/profile" element={<Profile />} />
                <Route path="/my-bookings" element={<MyBookings />} />
                <Route path="/user/dashboard" element={<UserDashboard />} />
                <Route path="/taxi/register" element={<TaxiRegistration />} />
              </Route>

              {/* Protected Driver Routes */}
              <Route element={<DriverRoute />}>
                <Route path="/driver/dashboard" element={<DriverDashboard />} />
                <Route path="/driver/registration-status" element={<RegistrationStatus />} />
              </Route>

              {/* Protected Admin Routes */}
              <Route element={<AdminRoute />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/bookings" element={<AdminBookings />} />
                <Route path="/admin/taxis" element={<AdminTaxis />} />
                <Route path="/admin/gallery" element={<AdminGallery />} />
                <Route path="/admin/tour-packages" element={<AdminTourPackages />} />
              </Route>

              {/* 404 Route */}
              <Route path="*" element={
                <div className="min-h-screen flex items-center justify-center">
                  <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
                </div>
              } />
            </Routes>
          </div>
          <Footer />
        </div>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;