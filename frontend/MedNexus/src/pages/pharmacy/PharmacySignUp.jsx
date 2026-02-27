import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Heart,
  Pill,
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
import './PharmacySignUp.css';

const PharmacySignUp = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    owner_name: '',
    email: '',
    phone: '',
    password: '',
    pharmacy_name: '',
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
      await apiService.request('/api/pharmacies/signup', {
        method: 'POST',
        body: JSON.stringify(form),
      });

      navigate('/sign-in?role=pharmacy', { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to register pharmacy');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pharm-signup-page">
      <div className="pharm-signup-main">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pharm-signup-card"
        >
          {/* Left: Form */}
          <div className="pharm-signup-form-col">
            <div className="pharm-signup-header">
              <Link to="/" className="pharm-signup-logo">
                <div className="pharm-signup-logo-icon">
                  <Heart />
                </div>
                <div className="pharm-signup-logo-text">
                  Med<span>Nexus</span>
                </div>
              </Link>
              <div className="pharm-signup-badge">
                <span className="pharm-signup-badge-dot" />
                Pharmacy Onboarding
              </div>
            </div>

            <h1 className="pharm-signup-title">Register your Pharmacy</h1>
            <p className="pharm-signup-subtitle">
              Provide your business details below. Your pharmacy will be{' '}
              <span>reviewed and approved</span> by the MedNexus admin team before activation.
            </p>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="pharm-signup-error"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="pharm-signup-form">
              {/* Owner Name */}
              <div className="pharm-signup-field">
                <label className="pharm-signup-label">Owner Name</label>
                <div className="pharm-signup-input-wrap">
                  <User className="pharm-signup-input-icon" />
                  <input
                    type="text"
                    name="owner_name"
                    value={form.owner_name}
                    onChange={handleChange}
                    required
                    placeholder="Full name of the pharmacy owner"
                    className="pharm-signup-input"
                  />
                </div>
              </div>

              {/* Pharmacy Name */}
              <div className="pharm-signup-field">
                <label className="pharm-signup-label">Pharmacy Name</label>
                <div className="pharm-signup-input-wrap">
                  <Building2 className="pharm-signup-input-icon" />
                  <input
                    type="text"
                    name="pharmacy_name"
                    value={form.pharmacy_name}
                    onChange={handleChange}
                    required
                    placeholder="e.g. MedPoint Pharmacy"
                    className="pharm-signup-input"
                  />
                </div>
              </div>

              {/* Licence Number */}
              <div className="pharm-signup-field">
                <label className="pharm-signup-label">Licence Number</label>
                <div className="pharm-signup-input-wrap">
                  <FileText className="pharm-signup-input-icon" />
                  <input
                    type="text"
                    name="licence_number"
                    value={form.licence_number}
                    onChange={handleChange}
                    required
                    placeholder="Drug licence or registration number"
                    className="pharm-signup-input"
                  />
                </div>
                <p className="pharm-signup-helper">
                  Issued by the Directorate General of Drug Administration.
                </p>
              </div>

              {/* Email */}
              <div className="pharm-signup-field">
                <label className="pharm-signup-label">Email Address</label>
                <div className="pharm-signup-input-wrap">
                  <Mail className="pharm-signup-input-icon" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="pharmacy@example.com"
                    className="pharm-signup-input"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="pharm-signup-field">
                <label className="pharm-signup-label">Phone Number</label>
                <div className="pharm-signup-input-wrap">
                  <Phone className="pharm-signup-input-icon" />
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    placeholder="01XXXXXXXXX"
                    className="pharm-signup-input"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="pharm-signup-field">
                <label className="pharm-signup-label">Password</label>
                <div className="pharm-signup-input-wrap">
                  <Lock className="pharm-signup-input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    placeholder="Min 6 characters"
                    className="pharm-signup-input"
                  />
                  <button
                    type="button"
                    className="pharm-signup-eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                <p className="pharm-signup-helper">
                  Used to sign in after your account is approved.
                </p>
              </div>

              {/* Address Section */}
              <div className="pharm-signup-field pharm-signup-field--full">
                <label className="pharm-signup-label">
                  <MapPin size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '4px' }} />
                  Pharmacy Address
                </label>
                <div className="pharm-signup-address-grid">
                  <div className="pharm-signup-address-field pharm-signup-address-field--full">
                    <input
                      type="text"
                      name="street_address"
                      value={form.street_address}
                      onChange={handleChange}
                      required
                      placeholder="Street address, building, floor"
                      className="pharm-signup-input"
                    />
                    <span className="pharm-signup-address-hint">Street Address</span>
                  </div>
                  <div className="pharm-signup-address-field">
                    <input
                      type="text"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Dhaka"
                      className="pharm-signup-input"
                    />
                    <span className="pharm-signup-address-hint">City</span>
                  </div>
                  <div className="pharm-signup-address-field">
                    <input
                      type="text"
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Dhaka Division"
                      className="pharm-signup-input"
                    />
                    <span className="pharm-signup-address-hint">State / Division</span>
                  </div>
                  <div className="pharm-signup-address-field">
                    <input
                      type="text"
                      name="postal_code"
                      value={form.postal_code}
                      onChange={handleChange}
                      required
                      placeholder="e.g. 1205"
                      className="pharm-signup-input"
                    />
                    <span className="pharm-signup-address-hint">Postal Code</span>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="pharm-signup-footer">
                <p className="pharm-signup-note">
                  Your information is verified by our admin team and will not be shared without consent.
                </p>
                <button
                  type="submit"
                  disabled={loading}
                  className="pharm-signup-submit"
                >
                  {loading ? (
                    <div className="pharm-signup-spinner" />
                  ) : (
                    <>
                      Submit for Approval
                      <ArrowRight />
                    </>
                  )}
                </button>
              </div>

              <p className="pharm-signup-small">
                Already registered?{' '}
                <Link to="/sign-in/pharmacy">
                  <span>Sign in here</span>
                </Link>
              </p>
            </form>
          </div>

          {/* Right: Info panel */}
          <div className="pharm-signup-info-col">
            <div>
              <div className="pharm-signup-info-header">For pharmacy owners</div>
              <div className="pharm-signup-info-title">Why join MedNexus?</div>
              <p className="pharm-signup-info-text">
                Connect directly with prescribing doctors and patients.
                Streamline order fulfillment and grow your pharmacy business.
              </p>

              <div className="pharm-signup-info-list">
                <div className="pharm-signup-info-item">
                  <div className="pharm-signup-info-icon">
                    <ShieldCheck />
                  </div>
                  <div>
                    <strong>Verified Listings</strong>
                    <p>Only licensed pharmacies are onboarded, building patient trust.</p>
                  </div>
                </div>
                <div className="pharm-signup-info-item">
                  <div className="pharm-signup-info-icon">
                    <Clock />
                  </div>
                  <div>
                    <strong>Prescription Alerts</strong>
                    <p>Receive live notifications when doctors finalize prescriptions nearby.</p>
                  </div>
                </div>
                <div className="pharm-signup-info-item">
                  <div className="pharm-signup-info-icon">
                    <TrendingUp />
                  </div>
                  <div>
                    <strong>Business Insights</strong>
                    <p>Track orders, top-selling medicines, and revenue analytics in one dashboard.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="pharm-signup-info-footer">
              Licence data is used only for verification and complies with MedNexus data
              protection standards.
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PharmacySignUp;
