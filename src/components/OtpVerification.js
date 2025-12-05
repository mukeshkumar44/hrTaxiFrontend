import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/api';

const OtpVerification = () => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [emailChecked, setEmailChecked] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // URL से ईमेल पैरामीटर प्राप्त करें
  const searchParams = new URLSearchParams(location.search);
  const emailFromUrl = searchParams.get('email');
  
  // sessionStorage से ईमेल प्राप्त करें
  const emailFromStorage = sessionStorage.getItem('verificationEmail');
  
  // पहले URL से ईमेल चेक करें, फिर स्टेट से, फिर sessionStorage से
  const email = emailFromUrl || location.state?.email || emailFromStorage || '';
  
  useEffect(() => {
    // If no email is provided, redirect to signup
    if (!email) {
      navigate('/signup');
      return;
    }
    // Clear the sessionStorage item after using it
    sessionStorage.removeItem('verificationEmail');
    setEmailChecked(true);
    
    // Automatically request OTP if it hasn't been sent yet
    const requestOtp = async () => {
      try {
        await authService.sendOtp(email);
      } catch (err) {
        console.error('Failed to send OTP:', err);
        // Don't show error to user immediately, let them request manually if needed
      }
    };
    
    // Only request OTP if we're not coming from a manual resend
    if (timer === 30) {
      requestOtp();
    }
  }, [email, navigate, timer]);
  
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);
  
  const handleChange = (index, value) => {
    if (value.length <= 1 && /^[0-9]*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      // Auto focus next input
      if (value && index < 3) {
        document.getElementById(`otp-${index + 1}`).focus();
      }
    }
  };
  
  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };
  
  const handleResendOtp = async () => {
    try {
      setLoading(true);
      setError('');
      await authService.sendOtp(email);
      setTimer(30);
      // Show success message
      setError('OTP resent successfully! Please check your email.');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          'Failed to resend OTP. Please try again.';
      setError(errorMessage);
      console.error('Resend OTP error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const otpValue = otp.join('');
    if (otpValue.length !== 4) {
      setError('Please enter a valid 4-digit OTP');
      setLoading(false);
      return;
    }
    
    try {
      const response = await authService.verifyOtp(email, otpValue);
      setSuccess(true);
      
      // Store user data
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Redirect to profile page after successful verification
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          'OTP verification failed. Please try again.';
      setError(errorMessage);
      console.error('OTP verification error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-gray-100">
      {!emailChecked ? (
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
          </div>
          <p className="text-center mt-4 text-gray-600">Loading verification...</p>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">OTP Verification</h2>
          
          <p className="text-center text-gray-600 mb-4">
            We've sent a verification code to<br />
            <span className="font-medium">{email || 'your email address'}</span>
          </p>
          
          {/* Show message for registration flow */}
          {localStorage.getItem('token') && !localStorage.getItem('user') && (
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4 text-sm">
              An OTP was sent to your email during registration. Please check your inbox and enter the code below.
            </div>
          )}
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              OTP verified successfully! Redirecting...
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2 text-center">
                Enter 4-digit OTP
              </label>
              <div className="flex justify-center space-x-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-14 h-14 text-center text-xl font-bold border rounded-md shadow-sm focus:border-yellow-500 focus:ring focus:ring-yellow-200 focus:ring-opacity-50"
                    required
                    autoFocus={index === 0}
                  />
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <button
                type="submit"
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
                disabled={loading || success}
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Didn't receive the code?{' '}
                {timer > 0 ? (
                  <span className="text-gray-500">Resend in {timer}s</span>
                ) : (
                  <button 
                    type="button" 
                    onClick={handleResendOtp}
                    className="font-medium text-yellow-500 hover:text-yellow-400"
                    disabled={loading}
                  >
                    Resend OTP
                  </button>
                )}
              </p>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default OtpVerification;