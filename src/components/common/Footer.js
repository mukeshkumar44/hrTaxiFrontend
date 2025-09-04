import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">HR Taxi Service</h3>
            <p className="text-gray-400">Your reliable transportation partner for comfortable and safe rides across the city.</p>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider">Quick Links</h4>
            <ul className="mt-4 space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-white">Home</Link></li>
              <li><Link to="/tour-packages" className="text-gray-400 hover:text-white">Tour Packages</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-white">About Us</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider">Services</h4>
            <ul className="mt-4 space-y-2">
              <li><Link to="/services/airport" className="text-gray-400 hover:text-white">Airport Transfers</Link></li>
              <li><Link to="/services/city-tours" className="text-gray-400 hover:text-white">City Tours</Link></li>
              <li><Link to="/services/outstation" className="text-gray-400 hover:text-white">Outstation Rides</Link></li>
              <li><Link to="/services/corporate" className="text-gray-400 hover:text-white">Corporate Travel</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider">Contact Us</h4>
            <address className="mt-4 not-italic text-gray-400 space-y-2">
              <p>123 Taxi Street, City</p>
              <p>Phone: +1 234 567 890</p>
              <p>Email: info@hrtaxi.com</p>
              <div className="flex space-x-4 mt-3">
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Facebook</span>
                  <i className="fab fa-facebook"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Twitter</span>
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Instagram</span>
                  <i className="fab fa-instagram"></i>
                </a>
              </div>
            </address>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-700">
          <p className="text-center text-gray-400 text-sm">
            &copy; {currentYear} HR Taxi Service. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
