import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Stethoscope, ArrowRight } from 'lucide-react';
import apiService from '../../services/api';
import './DoctorSignIn.css';

const DoctorSignIn = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    phone: '',
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
      const data = await apiService.request('/api/doctors/signin', {
        method: 'POST',
        body: JSON.stringify({
          phone: form.phone,
          password: form.password,
        }),
      });
      localStorage.setItem('doctor_access_token', data.access_token);
      localStorage.setItem('doctor_user', JSON.stringify(data.user));
      localStorage.setItem('doctor_id', data.user.id);
      localStorage.setItem('doctor_name', data.user.name);
      // If no schedule configured yet, send to schedule setup first
      if (!data.user.schedule) {
        navigate('/doctor/schedule', { replace: true });
      } else {
        navigate('/doctor/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="doctor-signin-page">
      <div className="doctor-signin-bg">
        <motion.div
          className="doctor-signin-orb doctor-signin-orb--emerald"
          animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.6, 0.35] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="doctor-signin-orb doctor-signin-orb--cyan"
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="doctor-signin-orb doctor-signin-orb--indigo"
          animate={{ scale: [1, 1.25, 1], x: [0, 24, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="doctor-signin-grid" />
      </div>

      {/* Left: brand / messaging */}
      <div className="doctor-signin-left">
        <div className="doctor-signin-left-inner">
          <Link to="/" className="doctor-signin-logo-link">
            <div className="doctor-signin-logo-icon">
              <Heart />
            </div>
            <div className="doctor-signin-logo-text">
              Med<span>Nexus</span>
            </div>
          </Link>

          <div className="doctor-signin-hero">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="doctor-signin-heading"
            >
              Welcome back,
              <span>Doctor.</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="doctor-signin-description"
            >
              Sign in to manage appointments, review records, and connect with patients on a
              modern, intelligent platform built for clinicians.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="doctor-signin-stats"
            >
              <div>
                <div className="doctor-signin-stat-value">2K+</div>
                <div className="doctor-signin-stat-label">Appointments / month</div>
              </div>
              <div>
                <div className="doctor-signin-stat-value">4.9★</div>
                <div className="doctor-signin-stat-label">Average rating</div>
              </div>
            </motion.div>
          </div>

          <div className="doctor-signin-left-footer">
            © 2025 MedNexus. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right: sign-in form */}
      <div className="doctor-signin-right">
        {/* Mobile header */}
        <div className="doctor-signin-mobile-header">
          <Link to="/" className="doctor-signin-mobile-logo">
            <div className="doctor-signin-mobile-logo-icon">
              <Heart />
            </div>
            <div className="doctor-signin-mobile-logo-text">
              Med<span>Nexus</span>
            </div>
          </Link>
          <Link to="/" className="doctor-signin-mobile-back">
            Back
          </Link>
        </div>

        <div className="doctor-signin-main">
          <div className="doctor-signin-card">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="doctor-signin-title">Doctor Sign In</h1>
              <p className="doctor-signin-subtitle">
                Use your registered phone number and password to access your account.
              </p>

              {error && <div className="doctor-signin-error">{error}</div>}

              <form onSubmit={handleSubmit} className="doctor-signin-form">
                <div className="doctor-signin-field">
                  <div className="doctor-signin-label-row">
                    <label className="doctor-signin-label">Phone Number</label>
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    placeholder="+8801XXXXXXXXX"
                    className="doctor-signin-input"
                  />
                  <p className="doctor-signin-helper">
                    Must match the number used during registration.
                  </p>
                </div>

                <div className="doctor-signin-field">
                  <div className="doctor-signin-label-row">
                    <label className="doctor-signin-label">Password</label>
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    placeholder="Your password"
                    className="doctor-signin-input"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="doctor-signin-submit"
                >
                  {loading ? (
                    <div className="doctor-signin-spinner" />
                  ) : (
                    <>
                      Continue
                      <ArrowRight />
                    </>
                  )}
                </button>
              </form>

              <div className="doctor-signin-footer">
                New to MedNexus?{' '}
                <span>
                  <Link to="/sign-up/doctor">Create a doctor account</Link>
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorSignIn;


