import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTaxi, FaMapMarkedAlt, FaClock, FaStar, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaArrowRight } from 'react-icons/fa';
import { GiPathDistance, GiCarWheel, GiSteeringWheel } from 'react-icons/gi';
import { BsShieldCheck } from 'react-icons/bs';
import { RiCustomerService2Fill } from 'react-icons/ri';

// Animated background component
const AnimatedBackground = () => (
  <div className="absolute inset-0 overflow-hidden -z-10">
    <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 opacity-90"></div>
    <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:20px_20px] -z-10"></div>
  </div>
);

const Services = () => {
  const [activeTab, setActiveTab] = useState('taxi');
  const [isHovered, setIsHovered] = useState(null);
  
  const services = [
    {
      id: 'taxi',
      title: 'Premium Taxi Service',
      icon: <GiSteeringWheel className="text-5xl text-yellow-400" />,
      description: 'Experience luxury and comfort with our premium taxi service. Available 24/7 for all your transportation needs.',
      features: [
        { icon: <FaClock className="text-yellow-400" />, text: '24/7 Availability' },
        { icon: <GiCarWheel className="text-yellow-400" />, text: 'Luxury Fleet' },
        { icon: <BsShieldCheck className="text-yellow-400" />, text: 'Safe & Secure' },
      ],
      bgGradient: 'from-yellow-500/10 to-yellow-500/5',
      buttonColor: 'bg-yellow-500 hover:bg-yellow-600'
    },
    {
      id: 'tours',
      title: 'Guided Tours',
      icon: <FaMapMarkedAlt className="text-5xl text-blue-400" />,
      description: 'Discover hidden gems and popular attractions with our expert local guides.',
      features: [
        { icon: <FaMapMarkerAlt className="text-blue-400" />, text: 'Custom Routes' },
        { icon: <RiCustomerService2Fill className="text-blue-400" />, text: 'Local Guides' },
        { icon: <FaStar className="text-blue-400" />, text: '5-Star Rated' },
      ],
      bgGradient: 'from-blue-500/10 to-blue-500/5',
      buttonColor: 'bg-blue-500 hover:bg-blue-600'
    }
  ];

  const activeService = services.find(s => s.id === activeTab);

  return (
    <div className="relative -mt-10 overflow-hidden min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <AnimatedBackground />
      
      {/* Floating Elements */}
      <div className="absolute top-20 -left-20 w-96 h-96 bg-yellow-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-1/3 -right-20 w-96 h-96 bg-blue-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-20 left-1/2 w-96 h-96 bg-purple-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="relative z-10">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="pt-32 pb-20 px-4 text-center"
        >
          <motion.span 
            className="inline-block px-4 py-2 mb-4 text-sm font-semibold text-yellow-400 bg-yellow-400/10 rounded-full"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Premium Services
          </motion.span>
          <motion.h1 
            className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-blue-400"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Experience the Difference
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-300 max-w-3xl mx-auto"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Luxury transportation services designed for the modern traveler. Comfort, style, and reliability in every ride.
          </motion.p>
        </motion.div>

        {/* Service Tabs */}
        <div className="max-w-6xl mx-auto px-4 pb-20">
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {services.map((service) => (
              <motion.button
                key={service.id}
                onClick={() => setActiveTab(service.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  activeTab === service.id
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white shadow-lg shadow-yellow-500/20'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {service.title}
              </motion.button>
            ))}
          </div>

          {/* Service Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className={`bg-gradient-to-br ${activeService.bgGradient} backdrop-blur-lg rounded-3xl p-8 md:p-12 shadow-2xl border border-white/10`}
            >
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/5 mb-6">
                    {activeService.icon}
                  </div>
                  <h2 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                    {activeService.title}
                  </h2>
                  <p className="text-lg text-gray-300 mb-8">
                    {activeService.description}
                  </p>
                  <ul className="space-y-4 mb-10">
                    {activeService.features.map((feature, index) => (
                      <motion.li 
                        key={index} 
                        className="flex items-center text-gray-200"
                        whileHover={{ x: 5 }}
                      >
                        <span className="mr-3 text-yellow-400">{feature.icon}</span>
                        <span>{feature.text}</span>
                      </motion.li>
                    ))}
                  </ul>
                  <motion.button
                    whileHover={{ x: 5 }}
                    className={`${activeService.buttonColor} text-white px-8 py-4 rounded-full font-medium flex items-center gap-2 transition-all duration-300`}
                  >
                    Book Now <FaArrowRight />
                  </motion.button>
                </div>
                <div className="relative h-96 rounded-2xl overflow-hidden transform -rotate-1">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                  <img
                    src={activeTab === 'taxi' 
                      ? 'https://images.unsplash.com/photo-1542282088-72b9b561a861?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
                      : 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'}
                    alt={activeService.title}
                    className="w-full h-full object-cover transform transition-transform duration-700 hover:scale-105"
                  />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Add this to your global CSS or in a style tag */}
      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default Services;
