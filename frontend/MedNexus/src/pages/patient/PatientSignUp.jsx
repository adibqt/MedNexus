import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './PatientSignUp.css';

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
    <div className="patient-signup-page">
      {/* Decorative background */}
      <div className="patient-signup-bg">
        <motion.div
          className="patient-signup-orb patient-signup-orb--emerald"
          animate={{ scale: [1, 1.18, 1], opacity: [0.35, 0.6, 0.35] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="patient-signup-orb patient-signup-orb--cyan"
          animate={{ scale: [1.15, 1, 1.15], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="patient-signup-orb patient-signup-orb--purple"
          animate={{ scale: [1, 1.25, 1], x: [0, 36, 0] }}
          transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="patient-signup-grid" />
      </div>

      {/* Left Panel - Form */}
      <div className="patient-signup-left">
        <header className="patient-signup-header">
          <Link to="/" className="patient-signup-logo-link">
            <div className="patient-signup-logo-icon">
              <Heart />
            </div>
            <div className="patient-signup-logo-text">
              Med<span>Nexus</span>
            </div>
          </Link>
        </header>

        <div className="patient-signup-form-wrapper">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="patient-signup-card"
          >
            <h1 className="patient-signup-title">Create your account</h1>
            <p className="patient-signup-subtitle">
              Join <span>MedNexus</span> and take control of your health journey.
            </p>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="patient-signup-error"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="patient-signup-form">
              {/* Name */}
              <div>
                <label className="patient-signup-field-label">Full Name</label>
                <div className="patient-signup-field-wrapper">
                  <div className="patient-signup-field-icon">
                    <User />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="patient-signup-input"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="patient-signup-field-label">Email Address</label>
                <div className="patient-signup-field-wrapper">
                  <div className="patient-signup-field-icon">
                    <Mail />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="patient-signup-input"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="patient-signup-field-label">Phone Number</label>
                <div className="patient-signup-field-wrapper">
                  <div className="patient-signup-field-icon">
                    <Phone />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="patient-signup-input"
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="patient-signup-field-label">Password</label>
                <div className="patient-signup-field-wrapper">
                  <div className="patient-signup-field-icon">
                    <Lock />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="patient-signup-input"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="patient-signup-password-toggle"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="patient-signup-button"
              >
                {loading ? (
                  <div className="patient-signup-spinner" />
                ) : (
                  <>
                    Create Account
                    <ArrowRight />
                  </>
                )}
              </motion.button>
            </form>

            <p className="patient-signup-footer">
              Already have an account?{' '}
              <Link to="/sign-in/patient">Sign in</Link>
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Marketing Content */}
      <div className="patient-signup-right">
        <div className="patient-signup-right-inner">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className="patient-signup-chip">
              <span className="patient-signup-chip-dot" />
              Trusted by 50,000+ patients
            </div>

            <h2 className="patient-signup-heading">
              Your health,
              <span>reimagined.</span>
            </h2>

            <p className="patient-signup-description">
              Experience healthcare that puts you first. Book appointments, consult doctors, and manage your health — all in one place.
            </p>

            <div className="patient-signup-features">
              {features.map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + index * 0.08 }}
                  className="patient-signup-feature-card"
                >
                  <div className="patient-signup-feature-icon">
                    <Check />
                  </div>
                  <div className="patient-signup-feature-text">{feature}</div>
                </motion.div>
              ))}
            </div>

            <div className="patient-signup-stats">
              {[
                { value: '200+', label: 'Specialist doctors' },
                { value: '4.9★', label: 'Average rating' },
                { value: '24/7', label: 'Care support' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 + index * 0.08 }}
                  className="patient-signup-stat"
                >
                  <div className="patient-signup-stat-value">{stat.value}</div>
                  <div className="patient-signup-stat-label">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="patient-signup-testimonial"
          >
            <div className="patient-signup-testimonial-inner">
              <div className="patient-signup-avatar">S</div>
              <div>
                <p className="patient-signup-quote">
                  “MedNexus made it so easy to find a specialist and book an appointment.
                  The video consultation feature is a game-changer!”
                </p>
                <p className="patient-signup-author">Sarah Johnson</p>
                <p className="patient-signup-author-meta">Patient since 2024</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PatientSignUp;
