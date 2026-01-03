import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

const OtpVerificationModal = ({ email, isOpen, onClose, onSuccess }) => {
  console.log('OtpVerificationModal rendered', { email, isOpen });
  const [otp, setOtp] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();

  // Reset OTP when email changes or modal opens
  useEffect(() => {
    console.log('OtpVerificationModal useEffect triggered', { isOpen, email });
    if (isOpen && email) {
      setOtp(['', '', '', '']);
      setTimer(30);
      setError('');
      setSuccess(false);
      
      // Automatically request OTP when modal opens
      const requestOtp = async () => {
        try {
          console.log('Sending OTP to email:', email);
          const response = await authService.sendOtp(email);
          console.log('OTP sent successfully', response);
        } catch (err) {
          console.error('Failed to send OTP:', err);
          console.error('Error details:', {
            message: err.message,
            response: err.response,
            status: err.response?.status,
            data: err.response?.data
          });
          // Don't show error to user immediately, let them request manually if needed
        }
      };
      
      requestOtp();
    }
  }, [email, isOpen]);

  // Timer effect
  useEffect(() => {
    if (timer > 0 && isOpen) {
      const interval = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer, isOpen]);

  const handleChange = (index, value) => {
    if (value.length <= 1 && /^[0-9]*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      // Auto focus next input
      if (value && index < 3) {
        document.getElementById(`otp-modal-${index + 1}`).focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-modal-${index - 1}`).focus();
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
      
      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
      
      // Close modal after successful verification
      setTimeout(() => {
        onClose();
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

  // Don't render if not open
  console.log('Checking if modal should render', { isOpen });
  if (!isOpen) {
    console.log('Modal is not open, returning null');
    return null;
  }
  
  console.log('Rendering OTP modal', { email });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">OTP Verification</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              disabled={loading || success}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <p className="text-gray-600 mb-4">
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
                    id={`otp-modal-${index}`}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-14 h-14 text-center text-xl font-bold border rounded-md shadow-sm focus:border-yellow-500 focus:ring focus:ring-yellow-200 focus:ring-opacity-50"
                    required
                    autoFocus={index === 0}
                    disabled={loading || success}
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
      </div>
    </div>
  );
};

export default OtpVerificationModal;