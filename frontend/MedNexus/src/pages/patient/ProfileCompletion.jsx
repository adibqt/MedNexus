import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Calendar, 
  Scale, 
  Ruler, 
  FileText, 
  ArrowRight, 
  Plus, 
  X, 
  Droplets,
  Shield,
  Activity,
  User,
  CheckCircle2,
  Camera,
  Upload,
  Trash2,
  Users,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';
import './ProfileCompletion.css';

const ProfileCompletion = () => {
  const navigate = useNavigate();
  const { user, completeProfile, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentCondition, setCurrentCondition] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    weight: '',
    height: '',
    blood_group: '',
    conditions: [],
  });

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const removeProfilePicture = () => {
    setProfilePicture(null);
    setProfilePicturePreview(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const addCondition = () => {
    if (currentCondition.trim() && !formData.conditions.includes(currentCondition.trim())) {
      setFormData({
        ...formData,
        conditions: [...formData.conditions, currentCondition.trim()],
      });
      setCurrentCondition('');
    }
  };

  const removeCondition = (condition) => {
    setFormData({
      ...formData,
      conditions: formData.conditions.filter((c) => c !== condition),
    });
  };

  const toggleCondition = (condition) => {
    if (formData.conditions.includes(condition)) {
      removeCondition(condition);
    } else {
      setFormData({
        ...formData,
        conditions: [...formData.conditions, condition],
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await completeProfile({
        age: parseInt(formData.age),
        gender: formData.gender || null,
        weight: parseFloat(formData.weight),
        height: parseFloat(formData.height),
        blood_group: formData.blood_group || null,
        medical_conditions: formData.conditions.length > 0 ? formData.conditions.join(', ') : null,
      });

      if (profilePicture) {
        try {
          const updatedUser = await apiService.uploadProfilePicture(profilePicture);
          updateUser(updatedUser);
        } catch (picError) {
          console.error('Failed to upload profile picture:', picError);
        }
      }

      navigate('/patient/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to complete profile');
    } finally {
      setLoading(false);
    }
  };

  const commonConditions = [
    'Diabetes',
    'Hypertension',
    'Asthma',
    'Heart Disease',
    'Thyroid',
    'Allergies',
    'Arthritis',
    'Depression',
  ];

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const steps = [
    { id: 1, status: 'complete' },
    { id: 2, status: 'current' },
    { id: 3, status: 'upcoming' },
  ];

  return (
    <div className="profile-completion">
      {/* Left Sidebar */}
      <aside className="profile-sidebar">
        <div className="sidebar-bg-effects">
          <div className="sidebar-gradient-1" />
          <div className="sidebar-gradient-2" />
          <div className="sidebar-pattern" />
        </div>

        <div className="sidebar-content">
          {/* Logo */}
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">
              <Heart />
            </div>
            <div className="sidebar-logo-text">
              Med<span>Nexus</span>
            </div>
          </div>

          {/* Main Content */}
          <div className="sidebar-main">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="sidebar-greeting"
            >
              Almost there,<br />
              {user?.name?.split(' ')[0] || 'Friend'}! <span className="emoji">🎉</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="sidebar-description"
            >
              Help us personalize your healthcare experience by sharing a few health details.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="sidebar-features"
            >
              {[
                { icon: Shield, title: 'Secure & Private', desc: 'Your data is encrypted and fully protected' },
                { icon: Sparkles, title: 'Personalized Care', desc: 'Get tailored health recommendations' },
                { icon: Activity, title: 'Quick Setup', desc: 'Takes less than 2 minutes to complete' },
              ].map((item, idx) => (
                <div key={idx} className="sidebar-feature">
                  <div className="sidebar-feature-icon">
                    <item.icon />
                  </div>
                  <div className="sidebar-feature-content">
                    <h4>{item.title}</h4>
                    <p>{item.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Progress Steps */}
          <div className="sidebar-progress">
            <div className="progress-steps">
              {steps.map((step, idx) => (
                <div key={step.id} className="progress-step">
                  <div className={`progress-step-circle ${step.status}`}>
                    {step.status === 'complete' ? <CheckCircle2 size={18} /> : step.id}
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`progress-step-line ${step.status === 'complete' ? 'complete' : 'upcoming'}`} />
                  )}
                </div>
              ))}
            </div>
            <p className="progress-label">Step 2 of 3 — Health Profile</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="profile-main">
        {/* Mobile Header */}
        <div className="mobile-header">
          <div className="mobile-header-content">
            <div className="mobile-logo">
              <div className="mobile-logo-icon">
                <Heart />
              </div>
              <div className="mobile-logo-text">
                Med<span>Nexus</span>
              </div>
            </div>
            <div className="mobile-step-badge">Step 2/3</div>
          </div>
        </div>

        {/* Form Container */}
        <div className="profile-form-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Header */}
            <div className="form-header">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="form-badge"
              >
                <Activity />
                <span>Health Profile Setup</span>
              </motion.div>

              <h1 className="form-title">
                Let's personalize your
                <span className="form-title-accent">healthcare experience</span>
              </h1>

              <p className="form-subtitle">
                Share your health details so we can provide personalized recommendations and better care tailored just for you.
              </p>
            </div>

            {/* Error Alert */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="error-alert"
                >
                  <div className="error-icon">
                    <X />
                  </div>
                  <div className="error-content">
                    <h4>Something went wrong</h4>
                    <p>{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} className="profile-form">
              {/* Profile Picture Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="form-section"
              >
                <div className="section-header">
                  <div className="section-icon blue">
                    <Camera />
                  </div>
                  <div>
                    <h3 className="section-title">Profile Picture</h3>
                    <p className="section-subtitle">Optional — Add a photo to personalize your account</p>
                  </div>
                </div>

                <div className="profile-picture-container">
                  <div className="profile-avatar-wrapper">
                    <div className="profile-avatar">
                      {profilePicturePreview ? (
                        <img src={profilePicturePreview} alt="Profile" />
                      ) : (
                        <User />
                      )}
                    </div>
                    {profilePicturePreview && (
                      <motion.button
                        type="button"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        onClick={removeProfilePicture}
                        className="profile-avatar-remove"
                      >
                        <Trash2 />
                      </motion.button>
                    )}
                  </div>

                  <div className="upload-zone">
                    <label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePictureChange}
                        style={{ display: 'none' }}
                      />
                      <div className="upload-zone-inner">
                        <div className="upload-icon">
                          <Upload />
                        </div>
                        <p className="upload-text">
                          {profilePicturePreview ? 'Change photo' : 'Upload a photo'}
                        </p>
                        <p className="upload-hint">Drag & drop or click to browse</p>
                        <p className="upload-formats">PNG, JPG or WEBP (max 5MB)</p>
                      </div>
                    </label>
                  </div>
                </div>
              </motion.div>

              {/* Basic Info Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="form-section"
              >
                <div className="section-header">
                  <div className="section-icon emerald">
                    <Activity />
                  </div>
                  <div>
                    <h3 className="section-title">Basic Information</h3>
                    <p className="section-subtitle">Your vital health metrics</p>
                  </div>
                </div>

                <div className="fields-grid fields-grid-3">
                  {/* Age */}
                  <div className="form-field">
                    <label className="field-label">
                      <span>Age</span>
                      <span className="field-required">Required</span>
                    </label>
                    <div className="field-input-wrapper">
                      <div className="field-icon">
                        <Calendar />
                      </div>
                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        required
                        min="1"
                        max="150"
                        placeholder="25"
                        className="field-input"
                      />
                    </div>
                  </div>

                  {/* Gender */}
                  <div className="form-field">
                    <label className="field-label">
                      <span>Gender</span>
                      <span className="field-required">Required</span>
                    </label>
                    <div className="field-input-wrapper">
                      <div className="field-icon">
                        <Users />
                      </div>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        required
                        className="field-input field-select"
                      >
                        <option value="" disabled>Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                      <div className="field-select-arrow">
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Blood Group */}
                  <div className="form-field">
                    <label className="field-label">
                      <span>Blood Group</span>
                      <span className="field-required">Required</span>
                    </label>
                    <div className="field-input-wrapper">
                      <div className="field-icon">
                        <Droplets />
                      </div>
                      <select
                        name="blood_group"
                        value={formData.blood_group}
                        onChange={handleChange}
                        required
                        className="field-input field-select"
                      >
                        <option value="" disabled>Select type</option>
                        {bloodGroups.map((bg) => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                      <div className="field-select-arrow">
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="fields-grid fields-grid-2" style={{ marginTop: '24px' }}>
                  {/* Weight */}
                  <div className="form-field">
                    <label className="field-label">
                      <span>Weight (kg)</span>
                      <span className="field-required">Required</span>
                    </label>
                    <div className="field-input-wrapper">
                      <div className="field-icon">
                        <Scale />
                      </div>
                      <input
                        type="number"
                        name="weight"
                        value={formData.weight}
                        onChange={handleChange}
                        required
                        min="1"
                        max="500"
                        step="0.1"
                        placeholder="70"
                        className="field-input"
                      />
                    </div>
                  </div>

                  {/* Height */}
                  <div className="form-field">
                    <label className="field-label">
                      <span>Height (cm)</span>
                      <span className="field-required">Required</span>
                    </label>
                    <div className="field-input-wrapper">
                      <div className="field-icon">
                        <Ruler />
                      </div>
                      <input
                        type="number"
                        name="height"
                        value={formData.height}
                        onChange={handleChange}
                        required
                        min="30"
                        max="300"
                        step="0.1"
                        placeholder="175"
                        className="field-input"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Medical Conditions Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="form-section"
              >
                <div className="conditions-header">
                  <div className="section-header" style={{ marginBottom: 0 }}>
                    <div className="section-icon purple">
                      <FileText />
                    </div>
                    <div>
                      <h3 className="section-title">Medical Conditions</h3>
                      <p className="section-subtitle">Optional — Add any existing health conditions</p>
                    </div>
                  </div>
                  {formData.conditions.length > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="conditions-count"
                    >
                      <CheckCircle2 />
                      <span>{formData.conditions.length} selected</span>
                    </motion.div>
                  )}
                </div>

                <p className="conditions-label">Quick select common conditions:</p>
                <div className="conditions-grid">
                  {commonConditions.map((condition) => {
                    const isSelected = formData.conditions.includes(condition);
                    return (
                      <motion.button
                        key={condition}
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleCondition(condition)}
                        className={`condition-btn ${isSelected ? 'selected' : ''}`}
                      >
                        {isSelected ? <CheckCircle2 /> : <Plus />}
                        {condition}
                      </motion.button>
                    );
                  })}
                </div>

                <div className="custom-condition">
                  <p className="conditions-label">Add a custom condition:</p>
                  <div className="custom-condition-input">
                    <input
                      type="text"
                      value={currentCondition}
                      onChange={(e) => setCurrentCondition(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCondition())}
                      placeholder="Type condition name and press Enter..."
                      className="custom-condition-field"
                    />
                    <button
                      type="button"
                      onClick={addCondition}
                      className={`custom-condition-btn ${currentCondition.trim() ? 'active' : ''}`}
                    >
                      <Plus />
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {formData.conditions.filter(c => !commonConditions.includes(c)).length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="custom-conditions-list"
                    >
                      <p className="conditions-label">Custom conditions:</p>
                      <div className="custom-conditions-tags">
                        {formData.conditions
                          .filter(c => !commonConditions.includes(c))
                          .map((condition) => (
                            <motion.div
                              key={condition}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              className="custom-tag"
                            >
                              <span>{condition}</span>
                              <button type="button" onClick={() => removeCondition(condition)}>
                                <X />
                              </button>
                            </motion.div>
                          ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Submit Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="submit-section"
              >
                <div className="submit-info">
                  <h3>Ready to get started?</h3>
                  <p>Your personalized healthcare dashboard awaits.</p>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className="submit-btn"
                >
                  {loading ? (
                    <div className="spinner" />
                  ) : (
                    <>
                      Continue to Dashboard
                      <ArrowRight />
                    </>
                  )}
                </motion.button>
              </motion.div>
            </form>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default ProfileCompletion;
