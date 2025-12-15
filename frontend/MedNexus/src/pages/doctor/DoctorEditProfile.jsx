import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Image as ImageIcon } from 'lucide-react';
import apiService from '../../services/api';
import './DoctorEditProfile.css';

const specializationOptions = [
  'General Physician',
  'Cardiologist',
  'Pulmonologist',
  'Neurologist',
  'Gastroenterologist',
  'Dermatologist',
];

const DoctorEditProfile = () => {
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    specialization: '',
  });
  const [profileFile, setProfileFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('doctor_access_token');
    if (!token) {
      navigate('/sign-in/doctor', { replace: true });
      return;
    }

    const load = async () => {
      try {
        const data = await apiService.request('/api/doctors/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setDoctor(data);
        setForm({
          name: data.name || '',
          phone: data.phone || '',
          specialization: data.specialization || '',
        });
      } catch (e) {
        console.error(e);
        navigate('/sign-in/doctor', { replace: true });
      }
    };

    load();
  }, [navigate]);

  const avatarUrl =
    doctor && doctor.profile_picture
      ? apiService.getProfilePictureUrl(doctor.profile_picture)
      : null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setProfileFile(file);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('phone', form.phone);
      formData.append('specialization', form.specialization);
      if (profileFile) {
        formData.append('profile_picture', profileFile);
      }

      const updated = await apiService.updateDoctorProfile(formData);
      setDoctor(updated);
      navigate('/doctor/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const displayAvatar = profileFile
    ? URL.createObjectURL(profileFile)
    : avatarUrl || null;

  return (
    <div className="doctor-edit-page">
      <div className="doctor-edit-shell">
        <div className="doctor-edit-header">
          <div className="doctor-edit-header-left">
            <button
              type="button"
              onClick={() => navigate('/doctor/dashboard')}
              className="doctor-edit-button secondary"
              style={{ padding: '6px 12px' }}
            >
              <ArrowLeft size={14} />
              Back
            </button>
            <div>
              <div className="doctor-edit-heading">Edit doctor profile</div>
              <div className="doctor-edit-subtitle">
                Update your professional details and profile picture.
              </div>
            </div>
          </div>
          <div className="doctor-edit-pill">
            <span className="doctor-edit-pill-dot" />
            Profile settings
          </div>
        </div>

        <form onSubmit={handleSubmit} className="doctor-edit-form">
          {error && <div className="doctor-edit-error">{error}</div>}

          <div className="doctor-edit-field doctor-edit-field--full" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div className="doctor-edit-avatar">
              {displayAvatar ? (
                <img src={displayAvatar} alt="Preview" />
              ) : (
                <span>{form.name ? form.name.charAt(0).toUpperCase() : 'D'}</span>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <label className="doctor-edit-label">Profile picture</label>
              <label className="doctor-edit-upload-label">
                <span>
                  <ImageIcon size={14} style={{ marginRight: 6 }} />
                  Upload new photo
                </span>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  className="doctor-edit-upload-input"
                  onChange={handleFileChange}
                />
              </label>
              <div className="doctor-edit-upload-filename">
                {profileFile
                  ? profileFile.name
                  : avatarUrl
                  ? 'Using existing profile picture'
                  : 'No picture uploaded yet'}
              </div>
            </div>
          </div>

          <div className="doctor-edit-field">
            <label className="doctor-edit-label">Full name</label>
            <input
              type="text"
              name="name"
              className="doctor-edit-input"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Dr. John Doe"
            />
          </div>

          <div className="doctor-edit-field">
            <label className="doctor-edit-label">Phone number</label>
            <input
              type="tel"
              name="phone"
              className="doctor-edit-input"
              value={form.phone}
              onChange={handleChange}
              required
              placeholder="+8801XXXXXXXXX"
            />
            <p className="doctor-edit-helper">Used for contact and verification.</p>
          </div>

          <div className="doctor-edit-field doctor-edit-field--full">
            <label className="doctor-edit-label">Specialization</label>
            <div className="doctor-edit-select-wrapper">
              <select
                name="specialization"
                className="doctor-edit-select"
                value={form.specialization}
                onChange={handleChange}
                required
              >
                <option value="" disabled>
                  Select specialization
                </option>
                {specializationOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <div className="doctor-edit-select-arrow">
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
            <p className="doctor-edit-helper">
              This controls how MedNexus routes patients to your profile.
            </p>
          </div>

          <div className="doctor-edit-footer">
            <p className="doctor-edit-note">
              Changes take effect immediately across your doctor dashboard and future
              appointments.
            </p>
            <div className="doctor-edit-actions">
              <button
                type="button"
                className="doctor-edit-button secondary"
                onClick={() => navigate('/doctor/dashboard')}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="doctor-edit-button primary"
              >
                {loading ? 'Saving…' : 'Save changes'}
                {!loading && <Save size={16} />}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DoctorEditProfile;


