import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const PatientSignUp = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
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
      await signUp(formData);
      navigate('/patient/complete-profile');
    } catch (err) {
      setError(err.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    'Book appointments with top doctors',
    'Video consultations from home',
    'Secure health records',
    'Prescription delivery',
  ];

  return (
    <div className="min-h-screen w-full flex relative overflow-hidden" style={{ backgroundColor: '#0f172a' }}>
      {/* Full Screen Animated Background */}
      <div className="absolute inset-0">
        {/* Gradient Orbs */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-3xl" 
          style={{ backgroundColor: 'rgba(16, 185, 129, 0.3)' }} 
        />
        <motion.div 
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-3xl" 
          style={{ backgroundColor: 'rgba(6, 182, 212, 0.25)' }} 
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], x: [0, 50, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 w-96 h-96 rounded-full blur-3xl" 
          style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)' }} 
        />
        
        {/* Grid Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* Left Panel - Form with Glassmorphism */}
      <div className="w-full lg:w-1/2 flex flex-col relative z-10 p-6 lg:p-12">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#10b981' }}>
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">
              Med<span style={{ color: '#10b981' }}>Nexus</span>
            </span>
          </Link>
        </div>

        {/* Form Card */}
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md p-8 sm:p-10 rounded-3xl backdrop-blur-2xl border border-white/30 shadow-2xl"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.1)'
            }}
          >
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                Create your account
              </h1>
              <p className="text-gray-300 mb-8">
                Join MedNexus and take control of your health journey
              </p>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 rounded-xl text-red-300 text-sm"
                  style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.3)' }}
                >
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name
                  </label>
                  <div className="relative group">
                    <div className="absolute left-0 top-0 bottom-0 w-14 flex items-center justify-center rounded-l-xl border-r transition-all" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                      <User className="w-5 h-5 text-gray-400 group-focus-within:text-emerald-400 transition-colors" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      style={{ paddingLeft: '4.5rem', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderColor: 'rgba(255, 255, 255, 0.15)' }}
                      className="w-full pr-4 py-4 rounded-xl border text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-left"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute left-0 top-0 bottom-0 w-14 flex items-center justify-center rounded-l-xl border-r transition-all" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                      <Mail className="w-5 h-5 text-gray-400 group-focus-within:text-emerald-400 transition-colors" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      style={{ paddingLeft: '4.5rem', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderColor: 'rgba(255, 255, 255, 0.15)' }}
                      className="w-full pr-4 py-4 rounded-xl border text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-left"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <div className="relative group">
                    <div className="absolute left-0 top-0 bottom-0 w-14 flex items-center justify-center rounded-l-xl border-r transition-all" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                      <Phone className="w-5 h-5 text-gray-400 group-focus-within:text-emerald-400 transition-colors" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      style={{ paddingLeft: '4.5rem', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderColor: 'rgba(255, 255, 255, 0.15)' }}
                      className="w-full pr-4 py-4 rounded-xl border text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-left"
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative group">
                    <div className="absolute left-0 top-0 bottom-0 w-14 flex items-center justify-center rounded-l-xl border-r transition-all" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                      <Lock className="w-5 h-5 text-gray-400 group-focus-within:text-emerald-400 transition-colors" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength={6}
                      style={{ paddingLeft: '4.5rem', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderColor: 'rgba(255, 255, 255, 0.15)' }}
                      className="w-full pr-12 py-4 rounded-xl border text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-left"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
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
                  className="w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-70 shadow-lg"
                  style={{ backgroundColor: '#10b981', boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)' }}
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </motion.button>
              </form>

              <p className="mt-8 text-center text-gray-400">
                Already have an account?{' '}
                <Link to="/sign-in/patient" className="font-semibold hover:underline text-emerald-400">
                  Sign in
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Content */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10">
        {/* Content */}
        <div className="flex flex-col justify-center w-full p-12 xl:p-16">
          {/* Main Content */}
          <div className="flex-1 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-emerald-400 text-sm font-medium mb-6">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Trusted by 50,000+ patients
              </div>
              
              <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
                Your health,
                <span className="block bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  reimagined.
                </span>
              </h2>
              <p className="text-gray-400 text-lg mb-12 max-w-md">
                Experience healthcare that puts you first. Book appointments, consult doctors, and manage your health—all in one place.
              </p>

              {/* Feature Cards */}
              <div className="grid grid-cols-2 gap-4 mb-12">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-emerald-500/30 transition-all cursor-default"
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)' }}>
                      <Check className="w-5 h-5 text-emerald-400" />
                    </div>
                    <span className="text-white font-medium text-sm">{feature}</span>
                  </motion.div>
                ))}
              </div>

              {/* Stats Row */}
              <div className="flex items-center gap-8">
                {[
                  { value: '200+', label: 'Doctors' },
                  { value: '4.9★', label: 'Rating' },
                  { value: '24/7', label: 'Support' },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-sm text-gray-500">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Bottom Testimonial */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                S
              </div>
              <div>
                <p className="text-gray-300 text-sm mb-2">
                  "MedNexus made it so easy to find a specialist and book an appointment. The video consultation feature is a game-changer!"
                </p>
                <p className="text-white font-medium text-sm">Sarah Johnson</p>
                <p className="text-gray-500 text-xs">Patient since 2024</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PatientSignUp;
