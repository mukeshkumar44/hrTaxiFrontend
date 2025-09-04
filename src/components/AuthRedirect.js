import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthRedirect = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      // Ensure role is always an array for consistent checking
      const userRoles = Array.isArray(currentUser.role) 
        ? currentUser.role 
        : (currentUser.role ? [currentUser.role] : ['user']);
      
      // Redirect based on user role
      if (userRoles.includes('admin')) {
        navigate('/admin/dashboard');
      } else if (userRoles.includes('driver')) {
        navigate('/driver/dashboard');
      } else if (userRoles.includes('user')) {
        navigate('/user/dashboard');  
      } else {
        navigate('/');
      }
    } else {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  // Show loading spinner while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      <div className="ml-4 text-gray-600">Redirecting...</div>
    </div>
  );
};

export default AuthRedirect;
