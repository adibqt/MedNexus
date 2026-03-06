import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Heart,
  FlaskConical,
  ArrowRight,
  User,
  Mail,
  Phone,
  Lock,
  Building2,
  FileText,
  MapPin,
  Eye,
  EyeOff,
  ShieldCheck,
  Clock,
  TrendingUp,
} from 'lucide-react';
import apiService from '../../services/api';
import './ClinicSignUp.css';

const ClinicSignUp = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    owner_name: '',
    email: '',
    phone: '',
    password: '',
    clinic_name: '',
    licence_number: '',
    street_address: '',
    city: '',
    state: '',
    postal_code: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await apiService.request('/api/clinics/signup', {
        method: 'POST',
        body: JSON.stringify(form),
      });

      navigate('/sign-in?role=clinic', { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to register clinic');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="clinic-signup-page">
      <div className="clinic-signup-main">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="clinic-signup-card"
        >
          {/* Left: Form */}
          <div className="clinic-signup-form-col">
            <div className="clinic-signup-header">
              <Link to="/" className="clinic-signup-logo">
                <div className="clinic-signup-logo-icon">
                  <Heart />
                </div>
                <div className="clinic-signup-logo-text">
                  Med<span>Nexus</span>
                </div>
              </Link>
              <div className="clinic-signup-badge">
                <span className="clinic-signup-badge-dot" />
                Clinic Onboarding
              </div>
            </div>

            <h1 className="clinic-signup-title">Register your Clinic</h1>
            <p className="clinic-signup-subtitle">
              Provide your business details below. Your clinic will be{' '}
              <span>reviewed and approved</span> by the MedNexus admin team before activation.
            </p>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="clinic-signup-error"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="clinic-signup-form">
              {/* Owner Name */}
              <div className="clinic-signup-field">
                <label className="clinic-signup-label">Owner Name</label>
                <div className="clinic-signup-input-wrap">
                  <User className="clinic-signup-input-icon" />
                  <input
                    type="text"
                    name="owner_name"
                    value={form.owner_name}
                    onChange={handleChange}
                    required
                    placeholder="Full name of the clinic owner"
                    className="clinic-signup-input"
                  />
                </div>
              </div>

              {/* Clinic Name */}
              <div className="clinic-signup-field">
                <label className="clinic-signup-label">Clinic / Lab Name</label>
                <div className="clinic-signup-input-wrap">
                  <Building2 className="clinic-signup-input-icon" />
                  <input
                    type="text"
                    name="clinic_name"
                    value={form.clinic_name}
                    onChange={handleChange}
                    required
                    placeholder="e.g. MedPoint Diagnostic Lab"
                    className="clinic-signup-input"
                  />
                </div>
              </div>

              {/* Licence Number */}
              <div className="clinic-signup-field">
                <label className="clinic-signup-label">Licence Number</label>
                <div className="clinic-signup-input-wrap">
                  <FileText className="clinic-signup-input-icon" />
                  <input
                    type="text"
                    name="licence_number"
                    value={form.licence_number}
                    onChange={handleChange}
                    required
                    placeholder="e.g. DL-2024-XXXXX"
                    className="clinic-signup-input"
                  />
                </div>
              </div>

              {/* Address grid */}
              <div className="clinic-signup-address-grid">
                <div className="clinic-signup-field clinic-signup-address-full">
                  <label className="clinic-signup-label">Street Address</label>
                  <div className="clinic-signup-input-wrap">
                    <MapPin className="clinic-signup-input-icon" />
                    <input
                      type="text"
                      name="street_address"
                      value={form.street_address}
                      onChange={handleChange}
                      required
                      placeholder="House/Road/Area"
                      className="clinic-signup-input"
                    />
                  </div>
                </div>
                <div className="clinic-signup-field">
                  <label className="clinic-signup-label">City</label>
                  <div className="clinic-signup-input-wrap">
                    <input
                      type="text"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      required
                      placeholder="City"
                      className="clinic-signup-input clinic-signup-input--noicon"
                    />
                  </div>
                </div>
                <div className="clinic-signup-field">
                  <label className="clinic-signup-label">State / Division</label>
                  <div className="clinic-signup-input-wrap">
                    <input
                      type="text"
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                      required
                      placeholder="State"
                      className="clinic-signup-input clinic-signup-input--noicon"
                    />
                  </div>
                </div>
                <div className="clinic-signup-field">
                  <label className="clinic-signup-label">Postal Code</label>
                  <div className="clinic-signup-input-wrap">
                    <input
                      type="text"
                      name="postal_code"
                      value={form.postal_code}
                      onChange={handleChange}
                      required
                      placeholder="Postal Code"
                      className="clinic-signup-input clinic-signup-input--noicon"
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="clinic-signup-field">
                <label className="clinic-signup-label">Email</label>
                <div className="clinic-signup-input-wrap">
                  <Mail className="clinic-signup-input-icon" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="clinic@example.com"
                    className="clinic-signup-input"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="clinic-signup-field">
                <label className="clinic-signup-label">Phone Number</label>
                <div className="clinic-signup-input-wrap">
                  <Phone className="clinic-signup-input-icon" />
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    placeholder="01XXXXXXXXX"
                    className="clinic-signup-input"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="clinic-signup-field">
                <label className="clinic-signup-label">Password</label>
                <div className="clinic-signup-input-wrap">
                  <Lock className="clinic-signup-input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    placeholder="Min. 6 characters"
                    className="clinic-signup-input"
                  />
                  <button
                    type="button"
                    className="clinic-signup-eye"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                className="clinic-signup-submit"
                disabled={loading}
              >
                {loading ? (
                  <div className="clinic-signup-spinner" />
                ) : (
                  <>
                    Register Clinic <ArrowRight size={16} />
                  </>
                )}
              </motion.button>
            </form>

            <p className="clinic-signup-login-link">
              Already registered?{' '}
              <Link to="/sign-in/clinic">Sign in here</Link>
            </p>
          </div>

          {/* Right: Hero */}
          <div className="clinic-signup-hero-col">
            <div className="clinic-signup-hero-bg">
              <motion.div
                className="clinic-signup-hero-orb clinic-signup-hero-orb--1"
                animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.6, 0.35] }}
                transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="clinic-signup-hero-orb clinic-signup-hero-orb--2"
                animate={{ scale: [1.1, 1, 1.1], opacity: [0.25, 0.5, 0.25] }}
                transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>

            <div className="clinic-signup-hero-content">
              <div className="clinic-signup-hero-icon">
                <FlaskConical size={44} />
              </div>
              <h2 className="clinic-signup-hero-title">Why join MedNexus?</h2>
              <p className="clinic-signup-hero-text">
                Connect with patients needing lab tests, receive quotation requests digitally,
                and grow your diagnostic business.
              </p>

              <div className="clinic-signup-hero-features">
                <div className="clinic-signup-hero-feat">
                  <div className="clinic-signup-hero-feat-icon">
                    <ShieldCheck />
                  </div>
                  <div>
                    <div className="clinic-signup-hero-feat-title">Verified Platform</div>
                    <div className="clinic-signup-hero-feat-desc">
                      Admin-approved clinics only. Trusted by patients.
                    </div>
                  </div>
                </div>
                <div className="clinic-signup-hero-feat">
                  <div className="clinic-signup-hero-feat-icon">
                    <Clock />
                  </div>
                  <div>
                    <div className="clinic-signup-hero-feat-title">Digital Quotations</div>
                    <div className="clinic-signup-hero-feat-desc">
                      Receive and respond to lab test requests instantly.
                    </div>
                  </div>
                </div>
                <div className="clinic-signup-hero-feat">
                  <div className="clinic-signup-hero-feat-icon">
                    <TrendingUp />
                  </div>
                  <div>
                    <div className="clinic-signup-hero-feat-title">Business Growth</div>
                    <div className="clinic-signup-hero-feat-desc">
                      Reach patients across all specializations.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ClinicSignUp;
