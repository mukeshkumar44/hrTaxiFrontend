import React, { useState } from 'react';
import { contactService } from '../services/api';

const Destinations = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    pickupLocation: '',
    dropLocation: '',
    date: '',
    time: '',
    passengers: '',
    vehicleType: '',
    paymentMethod: '',
    message: '',
    verification: '',
    termsAccepted: false
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (formData.verification.toUpperCase() !== 'TAXI') {
      setError('Please type TAXI to verify you are human');
      return;
    }
    
    if (!formData.termsAccepted) {
      setError('Please accept the terms and conditions');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await contactService.sendMessage(formData);
      console.log('Contact form submitted:', response.data);
      setSuccess(true);
      // Reset form
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        pickupLocation: '',
        dropLocation: '',
        date: '',
        time: '',
        passengers: '',
        vehicleType: '',
        paymentMethod: '',
        message: '',
        verification: '',
        termsAccepted: false
      });
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12 mt-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Destinations</h1>
          <p className="text-gray-600">Explore our stunning travel destinations for unforgettable experiences</p>
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {[
            {
              src: "https://images.unsplash.com/photo-1576668273152-af97d33cada5?auto=format&fit=crop&w=656&h=605",
              alt: "Yandex Taxi"
            },
            {
              src: "https://images.unsplash.com/photo-1519981840769-67000b906385?auto=format&fit=crop&w=656&h=605",
              alt: "Night Taxi"
            },
            {
              src: "https://images.unsplash.com/photo-1599550520333-507ba003c221?auto=format&fit=crop&w=656&h=605",
              alt: "Green Taxi"
            },
            {
              src: "https://images.unsplash.com/photo-1565432630377-4b0615928ce2?auto=format&fit=crop&w=656&h=605",
              alt: "Taxi Stand"
            }
          ].map((img, index) => (
            <div key={index} className="group relative rounded-lg overflow-hidden shadow-md">
              <img src={img.src} alt={img.alt} className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-semibold transition duration-300">
                {img.alt}
              </div>
            </div>
          ))}
        </div>

        {/* CTA Strip */}
        <div className="bg-yellow-400 text-black text-center py-4 font-bold text-lg mt-12 rounded shadow">
          🚕 Call Now and Book Instantly: +91-9999999999
        </div>

        {/* Contact Form */}
        <div className="my-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Contact Us</h2>
          <p className="text-gray-600 mb-8 text-center">Get in touch for inquiries about our taxi services, tours, and booking assistance. We're here to help!</p>

          <div className="relative bg-white shadow-2xl rounded-xl overflow-hidden max-w-4xl mx-auto border border-yellow-500">
            {/* Taxi Top Stripe */}
            <div className="h-3 bg-yellow-500 relative">
              <div className="absolute top-0 left-0 w-full h-full bg-[repeating-linear-gradient(45deg,#000,#000_10px,#FFD700_10px,#FFD700_20px)] opacity-70"></div>
            </div>

            {success ? (
              <div className="p-16 text-center">
                <div className="text-green-500 text-6xl mb-4">✓</div>
                <h3 className="text-2xl font-bold mb-2">Thank You!</h3>
                <p className="text-gray-600 mb-6">Your inquiry has been submitted successfully. We'll get back to you soon.</p>
                <button 
                  onClick={() => setSuccess(false)}
                  className="bg-yellow-500 text-black font-bold px-6 py-3 rounded-lg hover:bg-yellow-600 transition duration-300"
                >
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Form */}
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {error && (
                    <div className="md:col-span-2 p-3 bg-red-100 text-red-700 rounded">{error}</div>
                  )}
                  
                  <div className="space-y-4">
                    <input 
                      type="text" 
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Full Name" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500" 
                      required
                    />
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Email Address" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500" 
                      required
                    />
                    <input 
                      type="text" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Contact Number" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500" 
                      required
                    />
                    <input 
                      type="text" 
                      name="pickupLocation"
                      value={formData.pickupLocation}
                      onChange={handleChange}
                      placeholder="Pickup Location" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500" 
                      required
                    />
                    <input 
                      type="text" 
                      name="dropLocation"
                      value={formData.dropLocation}
                      onChange={handleChange}
                      placeholder="Drop Location" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500" 
                      required
                    />
                  </div>
                  <div className="space-y-4">
                    <input 
                      type="date" 
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500" 
                      required
                    />
                    <input 
                      type="time" 
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500" 
                      required
                    />
                    <select 
                      name="passengers"
                      value={formData.passengers}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      required
                    >
                      <option value="">No. of Passengers</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4+">4+</option>
                    </select>
                    <select 
                      name="vehicleType"
                      value={formData.vehicleType}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      required
                    >
                      <option value="">Select Vehicle Type</option>
                      <option value="sedan">Sedan</option>
                      <option value="suv">SUV</option>
                      <option value="van">Van</option>
                    </select>
                    <select 
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      required
                    >
                      <option value="">Select Payment Method</option>
                      <option value="cash">Cash</option>
                      <option value="online">Online</option>
                      <option value="upi">UPI</option>
                    </select>
                  </div>
                  <div className="md:col-span-2 space-y-4">
                    <textarea 
                      rows="4" 
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Your message" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    ></textarea>
                    <input 
                      type="text" 
                      name="verification"
                      value={formData.verification}
                      onChange={handleChange}
                      placeholder="Type 'TAXI' to confirm you're human" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500" 
                      required
                    />
                    <div className="flex items-start">
                      <input 
                        type="checkbox" 
                        name="termsAccepted"
                        checked={formData.termsAccepted}
                        onChange={handleChange}
                        className="mt-1 mr-2" 
                        required
                      />
                      <p className="text-sm text-gray-600">I agree to the terms and conditions</p>
                    </div>
                    <button 
                      type="submit" 
                      disabled={loading}
                      className={`w-full ${loading ? 'bg-gray-400' : 'bg-yellow-500 hover:bg-yellow-600'} text-black font-bold px-6 py-3 rounded-lg transition duration-300 flex justify-center items-center`}
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : '🚕 Submit your inquiry now'}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Taxi Footer Image */}
            <div className="h-44 w-full">
              <img src="https://images.unsplash.com/photo-1630352623287-4f1073a671ba?auto=format&fit=crop&w=2222&h=768" alt="Taxi Service" className="w-full h-full object-cover rounded-b-xl" />
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="text-center my-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">📩 Subscribe for Offers</h2>
          <p className="text-gray-600 mb-4">Get exclusive taxi deals straight to your inbox</p>
          <form className="flex justify-center gap-2 max-w-md mx-auto">
            <input type="email" placeholder="Your email" className="w-full px-4 py-2 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500" />
            <button className="bg-orange-500 text-white px-4 py-2 rounded-r-lg hover:bg-orange-600 transition duration-300">Subscribe</button>
          </form>
        </div>

        {/* FAQs */}
        <div className="max-w-3xl mx-auto mt-20 space-y-6">
          <h2 className="text-2xl font-bold text-center">FAQs</h2>
          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="font-semibold">How do I book a ride?</p>
            <p className="text-sm text-gray-700">Just fill out the form or call our number. It’s that easy!</p>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="font-semibold">Where do you operate?</p>
            <p className="text-sm text-gray-700">We provide services across major cities and rural areas in North India.</p>
          </div>
        </div>

        {/* Google Map - India */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">📍 Service Area</h2>
          <iframe
            className="w-full h-96 rounded-lg shadow-lg"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14204.977166601733!2d78.03219185!3d27.17501515!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39747c7b6dc17d43%3A0x9e94046b69326752!2sIndia!5e0!3m2!1sen!2sin!4v1628002481821!5m2!1sen!2sin"
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="India Map"
          ></iframe>
        </div>

      </div>
    </div>
  );
};

export default Destinations;
