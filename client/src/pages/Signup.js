import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from '../api/axiosInstance';

const SignupPage = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [signupStep, setSignupStep] = useState(1);
  const [verificationCode, setVerificationCode] = useState('');
  const [tempSignupData, setTempSignupData] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleVerificationCodeChange = (e) => {
    setVerificationCode(e.target.value);
  };

  const handleSendCode = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error('All fields are required');
      setLoading(false);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }
    if (formData.password.length < 6) { // Consider adding more robust password validation here
      toast.error('Password should be at least 6 characters');
      setLoading(false);
      return;
    }

    setTempSignupData({
      name: formData.name,
      email: formData.email,
      password: formData.password,
    });

    try {
      const response = await axiosInstance.post('/auth/send-verification-code', { email: formData.email });
      toast.success(response.data.message);
      setSignupStep(2);
    } catch (error) {
      console.error('Error sending verification code:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || 'Failed to send verification code. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!verificationCode) {
      toast.error('Verification code is required.');
      setLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.post('/auth/verify-code-and-register', {
        ...tempSignupData,
        code: verificationCode,
      });

      toast.success(response.data.message);

      if (response.data.customToken) {
        console.log("Frontend Received Custom Token (SignupPage.js):", response.data.customToken);
        await login({ customToken: response.data.customToken }); // This sets the currentUser and auth state
        toast.success("Login successful! Redirecting...");
        
        console.log("Attempting to navigate to /"); // Log before navigation
        navigate('/'); // Removed setTimeout for immediate redirection test
        
      } else {
        toast.info("Registration complete. Please log in manually."); // Changed message slightly
        console.log("Attempting to navigate to /login"); // Log before navigation
        navigate('/login'); // Removed setTimeout for immediate redirection test
      }

    } catch (error) {
      console.error('Error verifying code or registering:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || 'Failed to verify code or register. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center"
      style={{
        backgroundImage: "url('https://images.pexels.com/photos/163185/old-retro-antique-vintage-163185.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')",
      }}
    >
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <form
        onSubmit={signupStep === 1 ? handleSendCode : handleVerifyAndRegister}
        className="bg-white/30 backdrop-blur-sm w-[500px] p-8 rounded-lg shadow-lg z-10"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Create Your Account</h2>

        <div className="space-y-4">
          {signupStep === 1 && (
            <>
              <div>
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <input
                  type="password"
                  name="password"
                  placeholder="Password (min 6 characters)"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength="6"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </>
          )}

          {signupStep === 2 && (
            <>
              <p className="text-gray-700 text-center">A verification code has been sent to <b className="text-green-600">{tempSignupData.email}</b>. Please enter it below.</p>
              <div>
                <input
                  type="text"
                  name="verificationCode"
                  placeholder="Enter Verification Code"
                  value={verificationCode}
                  onChange={handleVerificationCodeChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full p-3 rounded-lg text-white font-medium transition ${loading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}`}
          >
            {loading ? 'Loading...' : (signupStep === 1 ? 'Send Verification Code' : 'Verify & Register')}
          </button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-green-600 hover:underline focus:outline-none"
            >
              Log in here
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default SignupPage;
