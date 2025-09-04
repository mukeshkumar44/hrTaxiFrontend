import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const AdminProfilePopup = ({ user, onClose, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'bg-gray-100 text-yellow-600' : 'text-gray-700';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-yellow-100 flex items-center justify-center text-2xl font-bold text-yellow-600">
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{user?.name || 'Admin User'}</h3>
                <p className="text-sm text-gray-500">{user?.email || 'admin@example.com'}</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                  {user?.role === 'admin' ? 'Administrator' : 'User'}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Admin Menu
            </h4>
            
            <Link
              to="/admin/dashboard"
              onClick={onClose}
              className={`flex items-center px-4 py-3 text-sm hover:bg-gray-100 rounded-md mb-1 ${isActive('/admin/dashboard')}`}
            >
              <svg className="h-5 w-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </Link>

            <Link
              to="/admin/users"
              onClick={onClose}
              className={`flex items-center px-4 py-3 text-sm hover:bg-gray-100 rounded-md mb-1 ${isActive('/admin/users')}`}
            >
              <svg className="h-5 w-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Manage Users
            </Link>

            <Link
              to="/admin/bookings"
              onClick={onClose}
              className={`flex items-center px-4 py-3 text-sm hover:bg-gray-100 rounded-md mb-1 ${isActive('/admin/bookings')}`}
            >
              <svg className="h-5 w-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Bookings
            </Link>

            <Link
              to="/admin/tours"
              onClick={onClose}
              className={`flex items-center px-4 py-3 text-sm hover:bg-gray-100 rounded-md mb-1 ${isActive('/admin/tours')}`}
            >
              <svg className="h-5 w-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              Tour Packages
            </Link>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Account
              </h4>
              
              <Link
                to="/admin/profile"
                onClick={onClose}
                className={`flex items-center px-4 py-3 text-sm hover:bg-gray-100 rounded-md mb-1 ${isActive('/admin/profile')}`}
              >
                <svg className="h-5 w-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                My Profile
              </Link>
              
              <Link
                to="/admin/settings"
                onClick={onClose}
                className={`flex items-center px-4 py-3 text-sm hover:bg-gray-100 rounded-md mb-1 ${isActive('/admin/settings')}`}
              >
                <svg className="h-5 w-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-3 text-sm text-left text-red-600 hover:bg-red-50 rounded-md mt-2"
              >
                <svg className="h-5 w-5 text-red-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfilePopup;
