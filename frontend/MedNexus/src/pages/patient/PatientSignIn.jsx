import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const PatientSignIn = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await signIn(formData);
      // Check if profile is complete
      if (response.user.is_profile_complete) {
        navigate('/patient/dashboard');
      } else {
        navigate('/patient/complete-profile');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden" style={{ backgroundColor: '#0f172a' }}>
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(16, 185, 129, 0.3)' }} />
        <div className="absolute bottom-1/4 right-10 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(6, 182, 212, 0.2)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-3xl" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)' }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between w-full p-12">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#10b981' }}>
              <Heart className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold text-white">
              Med<span style={{ color: '#10b981' }}>Nexus</span>
            </span>
          </Link>

          {/* Center Content */}
          <div className="flex-1 flex flex-col justify-center max-w-lg">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6"
            >
              Welcome back, we missed you!
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg text-gray-400 leading-relaxed"
            >
              Sign in to access your appointments, health records, and connect with your doctors.
            </motion.p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-12 grid grid-cols-3 gap-8"
            >
              {[
                { value: '50K+', label: 'Patients' },
                { value: '200+', label: 'Doctors' },
                { value: '99%', label: 'Satisfaction' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-3xl font-bold" style={{ color: '#10b981' }}>{stat.value}</div>
                  <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
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

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex flex-col bg-white">
        {/* Mobile Header */}
        <div className="lg:hidden p-6 flex items-center justify-between border-b border-gray-100">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#10b981' }}>
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              Med<span style={{ color: '#10b981' }}>Nexus</span>
            </span>
          </Link>
          <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">
            Back
          </Link>
        </div>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center px-6 sm:px-12">
          <div className="w-full max-w-md">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                Sign in
              </h1>
              <p className="text-gray-500 mb-8">
                Enter your credentials to access your account
              </p>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm"
                >
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute left-0 top-0 bottom-0 w-14 flex items-center justify-center rounded-l-xl bg-gradient-to-b from-gray-50 to-gray-100 border-r border-gray-200 group-focus-within:from-emerald-50 group-focus-within:to-emerald-100 group-focus-within:border-emerald-200 transition-all">
                      <Mail className="w-5 h-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      style={{ paddingLeft: '4.5rem' }}
                      className="w-full pr-4 py-4 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-left"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <Link to="/forgot-password" className="text-sm font-medium hover:underline" style={{ color: '#10b981' }}>
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative group">
                    <div className="absolute left-0 top-0 bottom-0 w-14 flex items-center justify-center rounded-l-xl bg-gradient-to-b from-gray-50 to-gray-100 border-r border-gray-200 group-focus-within:from-emerald-50 group-focus-within:to-emerald-100 group-focus-within:border-emerald-200 transition-all">
                      <Lock className="w-5 h-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      style={{ paddingLeft: '4.5rem' }}
                      className="w-full pr-12 py-4 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-left"
                      placeholder="••••••••"
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

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className="w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-70"
                  style={{ backgroundColor: '#10b981' }}
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </motion.button>
              </form>

              <p className="mt-8 text-center text-gray-500">
                Don't have an account?{' '}
                <Link to="/sign-up/patient" className="font-semibold hover:underline" style={{ color: '#10b981' }}>
                  Create account
                </Link>
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientSignIn;
