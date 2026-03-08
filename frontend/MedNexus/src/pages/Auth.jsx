import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Eye, EyeOff, ArrowLeft, Check } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import apiService from '../services/api';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Sign In form state
  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  });

  // Sign Up form state
  const [signUpData, setSignUpData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem('access_token');
    if (token) {
      navigate('/patient/dashboard');
    }
  }, [navigate]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await apiService.loginPatient(signInData.email, signInData.password);
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.patient));
      setSuccess('Login successful! Redirecting...');
      setTimeout(() => navigate('/patient/dashboard'), 1000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (signUpData.password !== signUpData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (signUpData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const [firstName, ...lastNameParts] = signUpData.fullName.trim().split(' ');
      const lastName = lastNameParts.join(' ') || '';
      
      await apiService.registerPatient({
        first_name: firstName,
        last_name: lastName,
        email: signUpData.email,
        phone: signUpData.phone,
        password: signUpData.password
      });
      
      // Auto login after registration
      const loginResponse = await apiService.loginPatient(signUpData.email, signUpData.password);
      localStorage.setItem('access_token', loginResponse.access_token);
      localStorage.setItem('user', JSON.stringify(loginResponse.patient));
      setSuccess('Account created successfully! Redirecting...');
      setTimeout(() => navigate('/patient/dashboard'), 1000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    'Free first consultation',
    'Access 200+ verified doctors',
    'Secure video consultations',
    '24/7 support included',
  ];

  return (
    <div className="min-h-screen w-full flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute top-20 right-20 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div 
            className="absolute bottom-20 left-20 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl"
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 10, repeat: Infinity }}
          />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
              <Heart className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">
              Med<span className="text-emerald-400">Nexus</span>
            </span>
          </Link>

          {/* Main Content */}
          <div className="max-w-md">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold text-white mb-6 leading-tight"
            >
              Your Health Journey
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                Starts Here
              </span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-gray-300 text-lg mb-8"
            >
              Connect with world-class doctors, manage your health records, and get personalized care — all from one platform.
            </motion.p>

            {/* Features */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-gray-300">{feature}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Footer */}
          <div className="text-gray-500 text-sm">
            © 2025 MedNexus. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8">
            <Link to="/" className="flex items-center gap-3 justify-center">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                Med<span className="text-emerald-500">Nexus</span>
              </span>
            </Link>
          </div>

          {/* Back Button */}
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-emerald-600 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to home</span>
          </Link>

          {/* Auth Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
          >
            {/* Tabs */}
            <div className="flex mb-8 bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => { setActiveTab('signin'); setError(''); setSuccess(''); }}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                  activeTab === 'signin'
                    ? 'bg-white text-emerald-600 shadow-md'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setActiveTab('signup'); setError(''); setSuccess(''); }}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                  activeTab === 'signup'
                    ? 'bg-white text-emerald-600 shadow-md'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Success Message */}
            {success && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm flex items-center gap-2"
              >
                <Check className="w-5 h-5" />
                {success}
              </motion.div>
            )}

            {/* Error Message */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Sign In Form */}
            {activeTab === 'signin' && (
              <motion.form 
                key="signin"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onSubmit={handleSignIn} 
                className="space-y-5"
              >
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome Back</h2>
                  <p className="text-gray-500">Sign in to continue to MedNexus</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={signInData.email}
                    onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={signInData.password}
                      onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <a href="#" className="text-sm text-emerald-600 hover:underline">Forgot password?</a>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Signing in...
                    </span>
                  ) : 'Sign In'}
                </motion.button>

                <p className="text-center text-gray-500 text-sm">
                  Don't have an account?{' '}
                  <button 
                    type="button" 
                    onClick={() => { setActiveTab('signup'); setError(''); }}
                    className="text-emerald-600 font-semibold hover:underline"
                  >
                    Sign Up
                  </button>
                </p>
              </motion.form>
            )}

            {/* Sign Up Form */}
            {activeTab === 'signup' && (
              <motion.form 
                key="signup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                onSubmit={handleSignUp} 
                className="space-y-4"
              >
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">Create Account</h2>
                  <p className="text-gray-500">Join MedNexus today</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={signUpData.fullName}
                    onChange={(e) => setSignUpData({ ...signUpData, fullName: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={signUpData.email}
                    onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+880 1XXX XXXXXX"
                    value={signUpData.phone}
                    onChange={(e) => setSignUpData({ ...signUpData, phone: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min. 6 characters"
                      value={signUpData.password}
                      onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={signUpData.confirmPassword}
                      onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Creating Account...
                    </span>
                  ) : 'Create Account'}
                </motion.button>

                <p className="text-center text-gray-400 text-xs">
                  By signing up, you agree to our{' '}
                  <a href="#" className="text-emerald-600 hover:underline">Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" className="text-emerald-600 hover:underline">Privacy Policy</a>
                </p>

                <p className="text-center text-gray-500 text-sm">
                  Already have an account?{' '}
                  <button 
                    type="button" 
                    onClick={() => { setActiveTab('signin'); setError(''); }}
                    className="text-emerald-600 font-semibold hover:underline"
                  >
                    Sign In
                  </button>
                </p>
              </motion.form>
            )}
          </motion.div>

          {/* Additional Options */}
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              Are you a doctor?{' '}
              <Link to="/sign-in/doctor" className="text-emerald-600 font-semibold hover:underline">
                Sign in as Doctor
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
