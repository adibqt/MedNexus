import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './PatientSignIn.css';

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
    <div className="patient-signin-page">
      {/* Decorative background */}
      <div className="patient-signin-bg">
        <motion.div
          className="patient-signin-orb patient-signin-orb--emerald"
          animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.6, 0.35] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="patient-signin-orb patient-signin-orb--cyan"
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="patient-signin-orb patient-signin-orb--indigo"
          animate={{ scale: [1, 1.2, 1], x: [0, 30, 0] }}
          transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="patient-signin-grid" />
      </div>

      {/* Left Panel - Brand / Story */}
      <div className="patient-signin-left">
        <div className="patient-signin-left-inner">
          <Link to="/" className="patient-signin-logo-link">
            <div className="patient-signin-logo-icon">
              <Heart />
            </div>
            <div className="patient-signin-logo-text">
              Med<span>Nexus</span>
            </div>
          </Link>

          <div className="patient-signin-hero">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="patient-signin-heading"
            >
              Welcome back,
              <span>your care is waiting.</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="patient-signin-description"
            >
              Sign in to access your appointments, health records, and connect with your
              doctors — all from one intelligent, secure dashboard.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="patient-signin-stats"
            >
              {[
                { value: '50K+', label: 'Patients cared for' },
                { value: '200+', label: 'Verified doctors' },
                { value: '99%', label: 'Satisfaction rate' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="patient-signin-stat-value">{stat.value}</div>
                  <div className="patient-signin-stat-label">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          <div className="patient-signin-left-footer">
            © 2025 MedNexus. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="patient-signin-right">
        {/* Mobile Header */}
        <div className="patient-signin-mobile-header">
          <Link to="/" className="patient-signin-mobile-logo">
            <div className="patient-signin-mobile-logo-icon">
              <Heart />
            </div>
            <div className="patient-signin-mobile-logo-text">
              Med<span>Nexus</span>
            </div>
          </Link>
          <Link to="/" className="patient-signin-mobile-back">
            Back
          </Link>
        </div>

        {/* Form */}
        <div className="patient-signin-main">
          <div className="patient-signin-card">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="patient-signin-title">Sign in</h1>
              <p className="patient-signin-subtitle">
                Enter your credentials to access your account.
              </p>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="patient-signin-error"
                >
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="patient-signin-form">
                {/* Email */}
                <div>
                  <div className="patient-signin-field-label-row">
                    <label className="patient-signin-field-label">Email Address</label>
                  </div>
                  <div className="patient-signin-field-wrapper">
                    <div className="patient-signin-field-icon">
                      <Mail />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="patient-signin-input"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="patient-signin-field-label-row">
                    <label className="patient-signin-field-label">Password</label>
                    <Link to="/forgot-password" className="patient-signin-forgot-link">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="patient-signin-field-wrapper">
                    <div className="patient-signin-field-icon">
                      <Lock />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="patient-signin-input"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="patient-signin-password-toggle"
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
                  className="patient-signin-submit"
                >
                  {loading ? (
                    <div className="patient-signin-spinner" />
                  ) : (
                    <>
                      Sign In
                      <ArrowRight />
                    </>
                  )}
                </motion.button>
              </form>

              <p className="patient-signin-footer">
                Don't have an account?{' '}
                <Link to="/sign-up/patient">Create account</Link>
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientSignIn;
