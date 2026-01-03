import React, { useState } from 'react';
import { authService } from '../services/api';

const TestOtp = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSendOtp = async () => {
    try {
      setMessage('Sending OTP...');
      await authService.sendOtp(email);
      setMessage('OTP sent successfully! Check your email.');
    } catch (err) {
      console.error('Error sending OTP:', err);
      setMessage('Failed to send OTP: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Test OTP Sending</h2>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Enter your email"
        />
      </div>
      <button
        onClick={handleSendOtp}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        Send OTP
      </button>
      {message && (
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <p>{message}</p>
        </div>
      )}
    </div>
  );
};

export default TestOtp;