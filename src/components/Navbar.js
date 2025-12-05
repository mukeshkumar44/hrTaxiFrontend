import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    setIsProfileDropdownOpen(false);
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-300 shadow-lg backdrop-blur-sm bg-opacity-90 transition-all duration-300 hover:shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 transform hover:scale-105 transition-transform duration-300">
            <Link to="/" className="text-white text-2xl font-bold flex items-center">
              <span className="bg-black bg-opacity-20 px-3 py-1 rounded-lg mr-2">🚕</span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-black to-gray-800">HRTaxi</span>
            </Link>
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-6">
              <Link 
                to="/" 
                className="relative text-gray-800 hover:text-black px-3 py-2 text-sm font-medium group"
              >
                <span className="relative group-hover:opacity-100">
                  Home
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full"></span>
                </span>
              </Link>
              <Link 
                to="/destinations" 
                className="relative text-gray-800 hover:text-black px-3 py-2 text-sm font-medium group"
              >
                <span className="relative group-hover:opacity-100">
                  Destinations
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full"></span>
                </span>
              </Link>
              <Link 
                to="/services" 
                className="relative text-gray-800 hover:text-black px-3 py-2 text-sm font-medium group"
              >
                <span className="relative group-hover:opacity-100">
                  Services
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full"></span>
                </span>
              </Link>
              <Link 
                to="/booking" 
                className="relative text-gray-800 hover:text-black px-3 py-2 text-sm font-medium group"
              >
                <span className="relative group-hover:opacity-100">
                  Booking
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full"></span>
                </span>
              </Link>
            </div>
          </div>

          {/* Auth Buttons or User Profile - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <div className="relative">
                <button 
                  onClick={toggleProfileDropdown}
                  className="flex items-center text-white hover:text-yellow-400 focus:outline-none"
                >
                  <span className="mr-2">{user?.name?.split(' ')[0] || 'User'}</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Profile Dropdown */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                   

                    <Link 
                      to="/my-bookings" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      My Bookings
                    </Link>

                    <Link 
                      to="/profile" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      My Profile
                    </Link>

                    {/* Driver Dashboard Link */}
                    {user && (user.role === 'driver' || (Array.isArray(user.roles) && user.roles.includes('driver'))) && (
                      <Link 
                        to="/driver/dashboard" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        Driver Dashboard
                      </Link>
                    )}
                    
                    {/* Taxi Registration Link */}
                    {user && (!user.role || user.role === 'user' || (Array.isArray(user.roles) && !user.roles.includes('driver'))) && (
                      <Link 
                        to="/taxi/register" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        Register as Driver
                      </Link>
                    )}
                    {user && (
                                    <Link
                                      to={user.role === 'admin' || (user.roles && user.roles.includes('admin')) ? "/admin/dashboard" : "/user/dashboard"}
                                      className="border-transparent text-gray-500 hover:border-yellow-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                                     onClick={toggleMenu}>
                                     My Dashboard
                                    </Link>
                                  )}
                    
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                    
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-white hover:text-yellow-400 px-3 py-2 text-sm font-medium"
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-300"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-800 hover:text-black focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden bg-white shadow-lg rounded-b-lg`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:bg-yellow-50" onClick={toggleMenu}>Home</Link>
          <Link to="/destinations" className="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:bg-yellow-50" onClick={toggleMenu}>Destinations</Link>
          <Link to="/services" className="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:bg-yellow-50" onClick={toggleMenu}>Services</Link>
          <Link to="/booking" className="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:bg-yellow-50" onClick={toggleMenu}>Booking</Link>
          {/* Auth Links - Mobile */}
          {isLoggedIn ? (
            <>
              <div className="border-t border-gray-800 pt-4 pb-3">
                <div className="px-3 py-2">
                  <p className="text-gray-800 font-medium">{user?.name || 'User'}</p>
                  <p className="text-gray-400 text-sm">{user?.email || ''}</p>
                </div>
                <Link 
                  to="/profile" 
                  className="text-gray-800 hover:text-black block px-3 py-2 text-base font-medium hover:border-yellow-500"
                  onClick={toggleMenu}
                >
                  My Profile
                </Link>

                <Link 
                  to="/my-bookings" 
                  className="text-gray-800 hover:text-black block px-3 py-2 text-base font-medium hover:border-yellow-500"
                  onClick={toggleMenu}
                >
                  My Bookings
                </Link>
                {/* <Link 
                  to="/user/dashboard" 
                  className="text-gray-800 hover:text-black block px-3 py-2 text-base font-medium hover:border-yellow-500"
                  onClick={toggleMenu}
                >
                  My Dashboard
                </Link> */}
                {user.role && (Array.isArray(user.role) ? user.role.includes('driver') : user.role === 'driver') && (
                  <Link 
                    to="/driver/dashboard" 
                    className="text-gray-800 hover:text-black block px-3 py-2 text-base font-medium hover:border-yellow-500"
                    onClick={toggleMenu}
                  >
                    Driver Panel
                  </Link>
                )}
                {user.role && (Array.isArray(user.role) ? user.role.includes('driver') : user.role === 'driver') && (
                  <Link 
                    to="/register-taxi" 
                    className="text-gray-800 hover:text-black block px-3 py-2 text-base font-medium hover:border-yellow-500"
                    onClick={toggleMenu}
                  >
                    My Taxi
                  </Link>
                )}
                {user.role && !(Array.isArray(user.role) ? user.role.includes('driver') : user.role === 'driver') && (
                  <Link 
                    to="/register-taxi" 
                    className="text-gray-800 hover:text-black hover:border-yellow-500 block px-3 py-2 text-base font-medium"
                    onClick={toggleMenu}
                  >
                    Register Taxi
                  </Link>
                )}
                {user && (
                                    <Link
                                      to={user.role === 'admin' || (user.roles && user.roles.includes('admin')) ? "/admin/dashboard" : "driver/dashboard"}
                                      className="border-transparent text-gray-500 hover:border-yellow-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium" onClick={toggleMenu}
                                    >
                                     My Dashboard
                                    </Link>
                                  )}
                <button 
                  onClick={() => {
                    handleLogout();
                    toggleMenu();
                  }}
                  className="text-gray-800 hover:text-black block w-full text-left px-3 py-2 text-base font-medium"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="border-t border-gray-800 pt-4">
              <Link 
                to="/login" 
                className="text-gray-800 hover:text-black block px-3 py-2 text-base font-medium"
                onClick={toggleMenu}
              >
                Login
              </Link>
              <Link 
                to="/signup" 
                className="text-yellow-500 hover:text-yellow-400 block px-3 py-2 text-base font-medium"
                onClick={toggleMenu}
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
