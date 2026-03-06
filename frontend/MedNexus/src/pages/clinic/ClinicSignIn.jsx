import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Heart,
  FlaskConical,
  ArrowRight,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import apiService from '../../services/api';
import './ClinicSignIn.css';

const ClinicSignIn = () => {
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
      const data = await apiService.request('/api/clinics/signin', {
        method: 'POST',
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      localStorage.setItem('clinic_access_token', data.access_token);
      localStorage.setItem('clinic_refresh_token', data.refresh_token);
      localStorage.setItem('clinic_user', JSON.stringify(data.user));
      localStorage.setItem('clinic_id', data.user.id);
      localStorage.setItem('clinic_name', data.user.clinic_name);

      navigate('/clinic/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="clinic-signin-page">
      <div className="clinic-signin-bg">
        <motion.div
          className="clinic-signin-orb clinic-signin-orb--cyan"
          animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.6, 0.35] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="clinic-signin-orb clinic-signin-orb--teal"
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="clinic-signin-orb clinic-signin-orb--sky"
          animate={{ scale: [1, 1.25, 1], x: [0, 24, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="clinic-signin-grid" />
      </div>

      {/* Left brand panel */}
      <div className="clinic-signin-left">
        <div className="clinic-signin-left-inner">
          <Link to="/" className="clinic-signin-logo-link">
            <div className="clinic-signin-logo-icon">
              <Heart />
            </div>
            <div className="clinic-signin-logo-text">
              Med<span>Nexus</span>
            </div>
          </Link>

          <div className="clinic-signin-hero">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="clinic-signin-heading"
            >
              Diagnostic Services,<br />
              <span>Digitally Connected</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="clinic-signin-desc"
            >
              Manage lab test quotation requests, respond with pricing,
              and grow your diagnostic business — all from one dashboard.
            </motion.p>

            <motion.div
              className="clinic-signin-stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <div className="clinic-signin-stat">
                <div className="clinic-signin-stat-num">500+</div>
                <div className="clinic-signin-stat-label">Lab Requests</div>
              </div>
              <div className="clinic-signin-stat-sep" />
              <div className="clinic-signin-stat">
                <div className="clinic-signin-stat-num">98%</div>
                <div className="clinic-signin-stat-label">Satisfaction</div>
              </div>
              <div className="clinic-signin-stat-sep" />
              <div className="clinic-signin-stat">
                <div className="clinic-signin-stat-num">24/7</div>
                <div className="clinic-signin-stat-label">Access</div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="clinic-signin-right">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="clinic-signin-card"
        >
          <div className="clinic-signin-card-header">
            <div className="clinic-signin-card-icon">
              <FlaskConical />
            </div>
            <h1>Clinic Sign In</h1>
            <p>Access your clinic dashboard</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="clinic-signin-error"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="clinic-signin-form">
            <div className="clinic-signin-field">
              <label>Email address</label>
              <div className="clinic-signin-input-wrap">
                <Mail className="clinic-signin-input-icon" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="clinic@example.com"
                />
              </div>
            </div>

            <div className="clinic-signin-field">
              <label>Password</label>
              <div className="clinic-signin-input-wrap">
                <Lock className="clinic-signin-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="Your password"
                />
                <button
                  type="button"
                  className="clinic-signin-eye"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              className="clinic-signin-submit"
              disabled={loading}
            >
              {loading ? (
                <div className="clinic-signin-spinner" />
              ) : (
                <>
                  Sign In <ArrowRight size={16} />
                </>
              )}
            </motion.button>
          </form>

          <p className="clinic-signin-register">
            Don't have an account?{' '}
            <Link to="/sign-up/clinic">Register your clinic</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ClinicSignIn;
