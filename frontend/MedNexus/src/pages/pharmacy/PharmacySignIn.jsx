import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Heart,
  Pill,
  ArrowRight,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import apiService from '../../services/api';
import './PharmacySignIn.css';

const PharmacySignIn = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await apiService.request('/api/pharmacies/signin', {
        method: 'POST',
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      localStorage.setItem('pharmacy_access_token', data.access_token);
      localStorage.setItem('pharmacy_refresh_token', data.refresh_token);
      localStorage.setItem('pharmacy_user', JSON.stringify(data.user));
      localStorage.setItem('pharmacy_id', data.user.id);
      localStorage.setItem('pharmacy_name', data.user.pharmacy_name);

      // Navigate to pharmacy Dashboard (placeholder for now)
      navigate('/pharmacy/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pharm-signin-page">
      <div className="pharm-signin-bg">
        <motion.div
          className="pharm-signin-orb pharm-signin-orb--purple"
          animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.6, 0.35] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="pharm-signin-orb pharm-signin-orb--indigo"
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="pharm-signin-orb pharm-signin-orb--fuchsia"
          animate={{ scale: [1, 1.25, 1], x: [0, 24, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="pharm-signin-grid" />
      </div>

      {/* Left brand panel */}
      <div className="pharm-signin-left">
        <div className="pharm-signin-left-inner">
          <Link to="/" className="pharm-signin-logo-link">
            <div className="pharm-signin-logo-icon">
              <Heart />
            </div>
            <div className="pharm-signin-logo-text">
              Med<span>Nexus</span>
            </div>
          </Link>

          <div className="pharm-signin-hero">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="pharm-signin-heading"
            >
              Welcome back,
              <span>Pharmacist.</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="pharm-signin-description"
            >
              Sign in to manage prescriptions, track inventory, and grow your pharmacy
              with MedNexus — the platform built for modern healthcare.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="pharm-signin-stats"
            >
              <div>
                <div className="pharm-signin-stat-value">500+</div>
                <div className="pharm-signin-stat-label">Prescriptions / month</div>
              </div>
              <div>
                <div className="pharm-signin-stat-value">98%</div>
                <div className="pharm-signin-stat-label">Fulfilment rate</div>
              </div>
            </motion.div>
          </div>

          <div className="pharm-signin-left-footer">
            © 2026 MedNexus. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right: sign-in form */}
      <div className="pharm-signin-right">
        {/* Mobile header */}
        <div className="pharm-signin-mobile-header">
          <Link to="/" className="pharm-signin-mobile-logo">
            <div className="pharm-signin-mobile-logo-icon">
              <Heart />
            </div>
            <div className="pharm-signin-mobile-logo-text">
              Med<span>Nexus</span>
            </div>
          </Link>
          <Link to="/" className="pharm-signin-mobile-back">Back</Link>
        </div>

        <div className="pharm-signin-main">
          <div className="pharm-signin-card">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="pharm-signin-card-icon">
                <Pill />
              </div>

              <h1 className="pharm-signin-title">Pharmacy Sign In</h1>
              <p className="pharm-signin-subtitle">
                Use your registered email and password to access your pharmacy dashboard.
              </p>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="pharm-signin-error"
                >
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="pharm-signin-form">
                <div className="pharm-signin-field">
                  <label className="pharm-signin-label">Email Address</label>
                  <div className="pharm-signin-input-wrap">
                    <Mail className="pharm-signin-input-icon" />
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      placeholder="pharmacy@example.com"
                      className="pharm-signin-input"
                    />
                  </div>
                </div>

                <div className="pharm-signin-field">
                  <label className="pharm-signin-label">Password</label>
                  <div className="pharm-signin-input-wrap">
                    <Lock className="pharm-signin-input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      required
                      minLength={6}
                      placeholder="Your password"
                      className="pharm-signin-input"
                    />
                    <button
                      type="button"
                      className="pharm-signin-eye-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="pharm-signin-submit"
                >
                  {loading ? (
                    <div className="pharm-signin-spinner" />
                  ) : (
                    <>
                      Continue
                      <ArrowRight />
                    </>
                  )}
                </button>
              </form>

              <div className="pharm-signin-footer-text">
                New to MedNexus?{' '}
                <Link to="/sign-up/pharmacy">
                  <span>Register your pharmacy</span>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacySignIn;
