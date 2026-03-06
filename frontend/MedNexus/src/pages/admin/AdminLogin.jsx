import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Heart,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import './AdminLogin.css';

const AdminLogin = () => {
  const { login, loading } = useAdminAuth();
  const [email, setEmail] = useState('admin@mednexus.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setError('');
    setSubmitting(true);

    const result = await login({ email, password });
    if (!result.success) {
      setError(result.message || 'Invalid credentials. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="al">
      {/* Subtle background accents */}
      <div className="al-bg">
        <div className="al-bg__blob al-bg__blob--1" />
        <div className="al-bg__blob al-bg__blob--2" />
      </div>

      {/* Back link */}
      <motion.div
        className="al-back"
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Link to="/" className="al-back__link">
          <ArrowLeft size={18} />
          <span>Back to website</span>
        </Link>
      </motion.div>

      {/* Card */}
      <motion.div
        className="al-card"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Logo + heading */}
        <div className="al-head">
          <div className="al-logo">
            <Heart size={24} strokeWidth={2.5} />
          </div>
          <h1 className="al-title">
            Med<span>Nexus</span>
          </h1>
          <p className="al-subtitle">Admin Portal</p>
        </div>

        {/* Form */}
        <form className="al-form" onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className={`al-field ${focusedField === 'email' ? 'focused' : ''}`}>
            <label className="al-label" htmlFor="al-email">Email</label>
            <div className="al-input-wrap">
              <Mail size={18} className="al-input-icon" />
              <input
                id="al-email"
                className="al-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div className={`al-field ${focusedField === 'password' ? 'focused' : ''}`}>
            <label className="al-label" htmlFor="al-password">Password</label>
            <div className="al-input-wrap">
              <Lock size={18} className="al-input-icon" />
              <input
                id="al-password"
                className="al-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="al-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              className="al-error"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="al-submit"
            disabled={submitting || loading}
          >
            {submitting ? (
              <>
                <span className="al-spinner" />
                Signing in…
              </>
            ) : (
              <>
                Sign in
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="al-footer">
          Protected area &middot; Authorized personnel only
        </p>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
