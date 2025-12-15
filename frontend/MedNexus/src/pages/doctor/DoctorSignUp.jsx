import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Stethoscope, ArrowRight } from 'lucide-react';
import apiService from '../../services/api';
import './DoctorSignUp.css';

const DoctorSignUp = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [specializations, setSpecializations] = useState([]);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    specialization: '',
    bmdc_number: '',
    password: '',
  });

  const [files, setFiles] = useState({
    mbbs_certificate: null,
    fcps_certificate: null,
    profile_picture: null,
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  useEffect(() => {
    const loadSpecializations = async () => {
      try {
        const data = await apiService.getSpecializations();
        setSpecializations(data || []);
      } catch (e) {
        console.warn('Failed to load specializations, using empty list.', e);
      }
    };

    loadSpecializations();
  }, []);

  const handleFileChange = (field, fileList) => {
    const file = fileList?.[0] || null;
    setFiles((prev) => ({ ...prev, [field]: file }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!files.mbbs_certificate) {
      setError('MBBS certificate is required.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('phone', form.phone);
      formData.append('specialization', form.specialization);
      formData.append('bmdc_number', form.bmdc_number);
      formData.append('password', form.password);

      formData.append('mbbs_certificate', files.mbbs_certificate);
      if (files.fcps_certificate) {
        formData.append('fcps_certificate', files.fcps_certificate);
      }
      if (files.profile_picture) {
        formData.append('profile_picture', files.profile_picture);
      }

      await apiService.request('/api/doctors/signup', {
        method: 'POST',
        body: formData,
        // Fetch will infer multipart; no Content-Type header so boundary is set automatically
        headers: {}, 
      });

      navigate('/sign-in?role=doctor', { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to register doctor');
    } finally {
      setLoading(false);
    }
  };

  const mbbsName = files.mbbs_certificate?.name || 'PDF / image up to 10MB';
  const fcpsName = files.fcps_certificate?.name || 'Optional – only if applicable';
  const profileName = files.profile_picture?.name || 'Optional – professional headshot';

  return (
    <div className="doctor-signup-page">
      <div className="doctor-signup-main">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="doctor-signup-card"
        >
          {/* Left: Form */}
          <div className="doctor-signup-form-col">
            <div className="doctor-signup-header">
              <Link to="/" className="doctor-signup-logo">
                <div className="doctor-signup-logo-icon">
                  <Heart />
                </div>
                <div className="doctor-signup-logo-text">
                  Med<span>Nexus</span>
                </div>
              </Link>
              <div className="doctor-signup-badge">
                <span className="doctor-signup-badge-dot" />
                Doctor Onboarding
              </div>
            </div>

            <h1 className="doctor-signup-title">Join MedNexus as a doctor</h1>
            <p className="doctor-signup-subtitle">
              Provide your professional details and documents. Your profile will be{' '}
              <span>reviewed and approved</span> by the MedNexus admin team before activation.
            </p>

            {error && <div className="doctor-signup-error">{error}</div>}

            <form onSubmit={handleSubmit} className="doctor-signup-form">
              {/* Name */}
              <div className="doctor-signup-field">
                <div className="doctor-signup-label-row">
                  <label className="doctor-signup-label">Full Name</label>
                </div>
                <div className="doctor-signup-input-wrapper">
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="Dr. John Doe"
                    className="doctor-signup-input"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="doctor-signup-field">
                <div className="doctor-signup-label-row">
                  <label className="doctor-signup-label">Phone Number</label>
                </div>
                <div className="doctor-signup-input-wrapper">
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    placeholder="11-digit number, e.g. 01XXXXXXXXX"
                    pattern="\d{11}"
                    maxLength={11}
                    className="doctor-signup-input"
                  />
                </div>
                <p className="doctor-signup-helper">Used for contact and verification.</p>
              </div>

              {/* Specialization */}
              <div className="doctor-signup-field">
                <div className="doctor-signup-label-row">
                  <label className="doctor-signup-label">Specialization</label>
                </div>
                <div className="doctor-signup-input-wrapper">
                  <select
                    name="specialization"
                    value={form.specialization}
                    onChange={handleChange}
                    required
                    className="doctor-signup-select"
                  >
                    <option value="" disabled>
                      Select specialization
                    </option>
                    {specializations.map((spec) => (
                      <option key={spec.id} value={spec.name}>
                        {spec.name}
                      </option>
                    ))}
                  </select>
                  <div className="doctor-signup-select-arrow">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
                <p className="doctor-signup-helper">
                  This is mapped to patient symptoms on the MedNexus dashboard.
                </p>
              </div>

              {/* BMDC */}
              <div className="doctor-signup-field">
                <div className="doctor-signup-label-row">
                  <label className="doctor-signup-label">BMDC Number</label>
                </div>
                <div className="doctor-signup-input-wrapper">
                  <input
                    type="text"
                    name="bmdc_number"
                    value={form.bmdc_number}
                    onChange={handleChange}
                    required
                    placeholder="e.g. A-12345"
                    className="doctor-signup-input"
                  />
                </div>
                <p className="doctor-signup-helper">
                  Your registration number with the Bangladesh Medical & Dental Council.
                </p>
              </div>

              {/* Password */}
              <div className="doctor-signup-field">
                <div className="doctor-signup-label-row">
                  <label className="doctor-signup-label">Password</label>
                </div>
                <div className="doctor-signup-input-wrapper">
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    placeholder="At least 6 characters"
                    className="doctor-signup-input"
                  />
                </div>
                <p className="doctor-signup-helper">
                  This will be used to sign in after your account is approved.
                </p>
              </div>

              {/* MBBS Certificate */}
              <div className="doctor-signup-field doctor-signup-field--full">
                <div className="doctor-signup-label-row">
                  <label className="doctor-signup-label">MBBS Certificate</label>
                </div>
                <div className="doctor-signup-upload">
                  <label className="doctor-signup-upload-label">
                    <span>Upload MBBS certificate</span>
                    <span className="doctor-signup-upload-pill">Required</span>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      className="doctor-signup-upload-input"
                      onChange={(e) => handleFileChange('mbbs_certificate', e.target.files)}
                    />
                  </label>
                  <div className="doctor-signup-upload-filename">{mbbsName}</div>
                </div>
              </div>

              {/* FCPS Certificate */}
              <div className="doctor-signup-field doctor-signup-field--full">
                <div className="doctor-signup-label-row">
                  <label className="doctor-signup-label">FCPS Certificate</label>
                  <span className="doctor-signup-optional">Optional</span>
                </div>
                <div className="doctor-signup-upload">
                  <label className="doctor-signup-upload-label">
                    <span>Upload FCPS certificate (if any)</span>
                    <span className="doctor-signup-upload-pill">Optional</span>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      className="doctor-signup-upload-input"
                      onChange={(e) => handleFileChange('fcps_certificate', e.target.files)}
                    />
                  </label>
                  <div className="doctor-signup-upload-filename">{fcpsName}</div>
                </div>
              </div>

              {/* Profile Picture */}
              <div className="doctor-signup-field doctor-signup-field--full">
                <div className="doctor-signup-label-row">
                  <label className="doctor-signup-label">Profile Picture</label>
                  <span className="doctor-signup-optional">Optional</span>
                </div>
                <div className="doctor-signup-upload">
                  <label className="doctor-signup-upload-label">
                    <span>Upload a professional headshot</span>
                    <span className="doctor-signup-upload-pill">Optional</span>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp"
                      className="doctor-signup-upload-input"
                      onChange={(e) => handleFileChange('profile_picture', e.target.files)}
                    />
                  </label>
                  <div className="doctor-signup-upload-filename">{profileName}</div>
                </div>
              </div>

              {/* Footer / submit */}
              <div className="doctor-signup-footer">
                <p className="doctor-signup-note">
                  Your information will be used only for verification and will not be shared
                  publicly until approved.
                </p>
                <button
                  type="submit"
                  disabled={loading}
                  className="doctor-signup-submit"
                >
                  {loading ? (
                    <div className="doctor-signup-spinner" />
                  ) : (
                    <>
                      Submit for Approval
                      <ArrowRight />
                    </>
                  )}
                </button>
              </div>

              <p className="doctor-signup-small">
                Already registered? &nbsp;
                <span>Contact admin</span> after approval to receive your doctor login
                credentials.
              </p>
            </form>
          </div>

          {/* Right: Info / benefits */}
          <div className="doctor-signup-info-col">
            <div>
              <div className="doctor-signup-info-header">For medical professionals</div>
              <div className="doctor-signup-info-title">Why join MedNexus?</div>
              <p className="doctor-signup-info-text">
                MedNexus connects you with patients who match your specialization, helping
                you deliver better care with less administrative overhead.
              </p>

              <div className="doctor-signup-info-list">
                <div className="doctor-signup-info-item">
                  <div className="doctor-signup-info-bullet">1</div>
                  <div>
                    Verified profiles ensure that only licensed doctors with valid BMDC
                    registration are onboarded.
                  </div>
                </div>
                <div className="doctor-signup-info-item">
                  <div className="doctor-signup-info-bullet">2</div>
                  <div>
                    Smart routing maps patient symptoms to your specialization, bringing
                    you relevant cases.
                  </div>
                </div>
                <div className="doctor-signup-info-item">
                  <div className="doctor-signup-info-bullet">3</div>
                  <div>
                    A clean, modern dashboard to manage appointments, view records, and stay
                    connected with your patients.
                  </div>
                </div>
              </div>
            </div>
            <div className="doctor-signup-info-footer">
              BMDC and certificate data is used only for verification and complies with
              MedNexus data protection standards.
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DoctorSignUp;


